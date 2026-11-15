// Local DOM tests only. No external requests or email delivery.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const {Window}=await import(process.env.JIATOUR_DOM_MODULE || 'happy-dom');
const root=new URL('../',import.meta.url);
const js=await readFile(new URL('assets/site.js',root),'utf8');
const home=await readFile(new URL('index.html',root),'utf8');
const snow=await readFile(new URL('services/snow-trip-bus-hire-melbourne/index.html',root),'utf8');
function page(t,url,html){
  const w=new Window({url,settings:{disableJavaScriptFileLoading:true,disableCSSFileLoading:true}});
  w.document.write(html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<link[^>]*rel="(?:stylesheet|preload)"[^>]*>/g,''));
  w.eval(js);t.after(()=>w.happyDOM.abort());return w;
}
test('campaign survives homepage → service → quote, with correct trip selection',t=>{
  const landing=page(t,'https://www.jiatour.com.au/?utm_source=facebook&utm_medium=social&utm_campaign=snow_2027&utm_content=post_a&customer=private',home);
  const serviceUrl=landing.document.querySelector('[data-service="Snow trip"]').href;
  const service=page(t,serviceUrl,snow);
  const quoteUrl=service.document.querySelector('.service-hero .button-gold').href;
  const final=page(t,quoteUrl,home);
  assert.equal(final.document.querySelector('#service').value,'Snow trip');
  const params=new URL(quoteUrl).searchParams;
  for(const [key,value] of Object.entries({utm_source:'facebook',utm_medium:'social',utm_campaign:'snow_2027',utm_content:'post_a'}))assert.equal(params.get(key),value);
  assert.equal(params.get('customer'),null);
  assert.equal(final.localStorage.length,0);assert.equal(final.sessionStorage.length,0);assert.equal(final.document.cookie,'');
});
test('external contact links stay intact and malformed trip values cannot become form options',t=>{
  const w=page(t,'https://www.jiatour.com.au/?trip=%3Cscript%3E&utm_source=facebook',home);
  assert.equal(w.document.querySelector('#service').value,'');
  assert.equal(w.document.querySelector('a[href^="mailto:"]').href,'mailto:jiatour@hotmail.com');
  assert.equal(w.document.querySelector('a[href^="tel:"]').href,'tel:+61430218539');
  assert.equal(w.document.querySelector('.brand').getAttribute('href'),'#home');
});
test('campaign labels are bounded and direct visits remain untagged',t=>{
  const tagged=page(t,'https://www.jiatour.com.au/?utm_source=%00facebook%0A&utm_content='+ 'a'.repeat(120),home);
  const target=new URL(tagged.document.querySelector('.service-item').href);
  assert.equal(target.searchParams.get('utm_source'),'facebook');assert.equal(target.searchParams.get('utm_content').length,80);
  const direct=page(t,'https://www.jiatour.com.au/',home);
  assert.equal(new URL(direct.document.querySelector('.service-item').href).search,'');
});
