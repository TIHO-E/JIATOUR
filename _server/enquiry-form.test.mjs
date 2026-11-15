// Run with Happy DOM installed, or set JIATOUR_DOM_MODULE to its local ESM entry.
// All challenge callbacks and HTTP responses below are local mocks. No mail is sent.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {Window} = await import(process.env.JIATOUR_DOM_MODULE || 'happy-dom');
const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const siteJs = await readFile(new URL('assets/site.js', root), 'utf8');
const enquiryJs = await readFile(new URL('assets/enquiry.js', root), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const values = {Name:'QA NOT SENT', email:'qa@example.com', Phone:'0400000000', Journey:'Snow trip', Date:'2099-07-15', Passengers:'20', Vehicle:'34 seats', Pickup:'Melbourne', Destination:'Mount Buller', Notes:'Sample notes'};

function setup(t, {fetcher, noWidget = false} = {}) {
  const window = new Window({url:'https://www.jiatour.com.au/?utm_source=facebook&utm_medium=social&utm_campaign=charter', settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});
  const calls=[]; let callbacks; let resets=0;
  window.fetch=async (url, options) => {calls.push({url,options});return fetcher ? fetcher(url,options) : {ok:true,status:200,json:async()=>({ok:true,requestId:JSON.parse(options.body).requestId})};};
  if(!noWidget) window.turnstile={render:(_,options)=>{callbacks=options;return 'mock-widget';},reset:()=>{resets++;},remove:()=>{}};
  window.document.write(html.replace(/<script[^>]*src=[\s\S]*?<\/script>/g,'').replace(/<link[^>]*rel="(?:stylesheet|preload)"[^>]*>/g,''));
  window.eval(siteJs); window.eval(enquiryJs);
  const d=window.document, form=d.querySelector('#quote-form');
  for(const [key,value] of Object.entries(values))form.elements.namedItem(key).value=value;
  const submit=()=>{const event=new window.Event('submit',{bubbles:true,cancelable:true});form.dispatchEvent(event);return event;};
  t.after(async()=>window.happyDOM.abort());
  return {window,d,form,calls,submit,verify:token=>callbacks.callback(token||'mock-token'),get callbacks(){return callbacks;},get resets(){return resets;}};
}

test('uses the supplied public site key, strict endpoint and enquiry action', t=>{
  const h=setup(t);
  assert.equal(h.callbacks.sitekey,'0x4AAAAAAGBmhQ-OOyapcLjs');
  assert.equal(h.callbacks.action,'enquiry');
  assert.equal(h.form.dataset.enquiryEndpoint,'https://jiatour-enquiries.tiho-largaux.workers.dev/enquiry');
  assert.equal(h.d.querySelectorAll('[name="_autoresponse"],[name="_subject"],[name="_next"]').length,0);
  assert(h.d.querySelector('button[type="submit"]').disabled);
  assert(h.d.querySelector('meta[http-equiv="Content-Security-Policy"]').content.includes("form-action 'none'"));
});

test('blocks native submission and invalid or unverified enquiries', async t=>{
  const h=setup(t);
  assert(h.submit().defaultPrevented); await tick(); assert.equal(h.calls.length,0);
  h.verify();h.form.elements.email.value='invalid';h.submit();await tick();assert.equal(h.calls.length,0);
  h.form.elements.email.value=values.email;h.form.elements.Passengers.value='0';h.submit();await tick();assert.equal(h.calls.length,0);
  h.form.elements.Passengers.value='20';h.form.elements.Date.value='2000-01-01';h.submit();await tick();assert.equal(h.calls.length,0);
});

test('sends JSON with campaign context but no secret and shows success only on acceptance',async t=>{
  let release;
  const h=setup(t,{fetcher:(_,options)=>new Promise(resolve=>{release=()=>resolve({ok:true,status:200,json:async()=>({ok:true,requestId:JSON.parse(options.body).requestId})});})});
  h.verify();h.submit();h.submit();await tick();assert.equal(h.calls.length,1);
  assert(h.d.querySelector('#enquiry-success').hidden);
  assert.equal(h.form.getAttribute('aria-busy'),'true');
  const body=JSON.parse(h.calls[0].options.body);
  assert.equal(body.Name,values.Name);assert.equal(body.utm_source,'facebook');assert.equal(body.turnstileToken,'mock-token');
  assert(!h.calls[0].options.headers.Authorization);assert.equal(h.calls[0].options.credentials,'omit');
  release();await tick();
  assert(!h.d.querySelector('#enquiry-success').hidden);assert(h.form.classList.contains('is-submitted'));
  h.submit();await tick();assert.equal(h.calls.length,1);
});

test('a rejected submission preserves inputs and reuses its id on an identical retry',async t=>{
  let fail=true;
  const h=setup(t,{fetcher:(_,options)=>({ok:!fail,status:fail?503:200,json:async()=>fail?{ok:false,code:'temporarily_unavailable'}:{ok:true,requestId:JSON.parse(options.body).requestId}})});
  h.verify();h.submit();await tick();
  assert(h.d.querySelector('#enquiry-success').hidden);assert.equal(h.form.elements.Name.value,values.Name);assert(!h.form.querySelector('fieldset').disabled);assert.equal(h.resets,1);
  const first=JSON.parse(h.calls[0].options.body);
  fail=false;h.verify('fresh-token');h.submit();await tick();
  const second=JSON.parse(h.calls[1].options.body);
  assert.equal(first.requestId,second.requestId);assert.notEqual(first.turnstileToken,second.turnstileToken);assert(!h.d.querySelector('#enquiry-success').hidden);
});

test('editing a failed enquiry creates a new idempotency id',async t=>{
  const h=setup(t,{fetcher:()=>({ok:false,status:400,json:async()=>({ok:false,code:'invalid_Date'})})});
  h.verify();h.submit();await tick();
  h.form.elements.Pickup.value='Updated location';h.verify('fresh-token');h.submit();await tick();
  assert.notEqual(JSON.parse(h.calls[0].options.body).requestId,JSON.parse(h.calls[1].options.body).requestId);
});

test('network and malformed responses cannot show a false success',async t=>{
  for(const fetcher of [()=>{throw new Error('timeout');},()=>({ok:true,status:200,json:async()=>{throw new Error('HTML response');}}),()=>({ok:true,status:200,json:async()=>({ok:true,requestId:'wrong-id'})})]){
    const h=setup(t,{fetcher});h.verify();h.submit();await tick();assert(h.d.querySelector('#enquiry-success').hidden);assert.equal(h.form.elements.email.value,values.email);assert(h.d.querySelector('#form-status').classList.contains('is-error'));
  }
});

test('expired or failed challenges disable submission and expose retry',async t=>{
  const h=setup(t);h.verify();h.callbacks['expired-callback']();h.submit();await tick();
  assert.equal(h.calls.length,0);assert(h.d.querySelector('button[type="submit"]').disabled);assert(!h.d.querySelector('#retry-verification').hidden);
  h.d.querySelector('#retry-verification').click();assert.equal(h.resets,1);
  h.callbacks['error-callback']();assert(h.d.querySelector('#form-status').classList.contains('is-error'));
});

test('blocked challenge script leaves a visible contact and retry path',t=>{
  const h=setup(t,{noWidget:true});
  const loader=h.d.querySelector('#jia-turnstile-api');assert(loader.src.startsWith('https://challenges.cloudflare.com/turnstile/v0/api.js'));
  loader.dispatchEvent(new h.window.Event('error'));
  assert(!h.d.querySelector('#retry-verification').hidden);assert(h.d.querySelector('button[type="submit"]').disabled);assert(h.d.querySelector('#form-status').textContent.includes('0430 218 539'));
});

test('service links, fleet selection, labels and mobile menu still work',t=>{
  const h=setup(t);
  for(const link of h.d.querySelectorAll('[data-service]')){link.dispatchEvent(new h.window.MouseEvent('click',{bubbles:true,cancelable:true}));assert.equal(h.form.elements.Journey.value,link.dataset.service);}
  for(const link of h.d.querySelectorAll('[data-vehicle]')){link.dispatchEvent(new h.window.MouseEvent('click',{bubbles:true,cancelable:true}));assert.equal(h.form.elements.Vehicle.value,link.dataset.vehicle);}
  for(const input of h.form.querySelectorAll('input:not([type=hidden]),select,textarea'))assert(input.labels.length>0,input.name);
  const menu=h.d.querySelector('.menu-toggle');menu.click();assert.equal(menu.getAttribute('aria-expanded'),'true');h.d.dispatchEvent(new h.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(menu.getAttribute('aria-expanded'),'false');
});
