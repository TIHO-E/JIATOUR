import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorker} from './enquiry-worker.mjs';

const env = {ENQUIRIES_ENABLED:'true', RESEND_API_KEY:'mock-resend-key', TURNSTILE_SECRET_KEY:'mock-turnstile-key'};
const fixture = {requestId:'a0605c26-b0cc-4f21-942b-54af75764013', turnstileToken:'mock-token', Name:'Alex <Test>', email:'alex@example.com', Phone:'0400000000', Journey:'Snow trip', Date:'2027-07-15', Passengers:'20', Vehicle:'34 seats', Pickup:'Melbourne', Destination:'Mount Buller', Notes:'A & B\n<script>bad()</script>', utm_source:'sample-campaign'};
const goodChallenge = {success:true, hostname:'www.jiatour.com.au', action:'enquiry'};
const asJson = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
function harness({challenge=goodChallenge, mail={data:[{id:'business-id'},{id:'customer-id'}]}, mailStatus=200, throws=false}={}) {
  const calls=[];
  const worker=createWorker({now:()=>new Date('2026-11-15T00:00:00Z'), fetcher:async(url,options)=>{
    calls.push({url,options});
    if(throws) throw new Error('Provider detail containing secret must not escape');
    return url.includes('siteverify') ? asJson(challenge) : asJson(mail,mailStatus);
  }});
  return {worker,calls};
}
function request(data=fixture,{origin='https://www.jiatour.com.au', type='application/json', method='POST', path='/enquiry'}={}) {
  return new Request('https://example.workers.dev'+path,{method,headers:{Origin:origin,'Content-Type':type},...(['GET','OPTIONS'].includes(method)?{}:{body:JSON.stringify(data)})});
}

test('valid request validates challenge and sends exactly two separate branded messages',async()=>{
  const {worker,calls}=harness(); const result=await worker.fetch(request(),env);
  assert.equal(result.status,200); assert.equal((await result.json()).ok,true); assert.equal(calls.length,2);
  assert(calls[0].url.includes('siteverify')); assert.equal(calls[1].url,'https://api.resend.com/emails/batch');
  const [business,customer]=JSON.parse(calls[1].options.body);
  assert.deepEqual(business.to,['jiatour@hotmail.com']); assert.equal(business.reply_to,'alex@example.com');
  assert.deepEqual(customer.to,['alex@example.com']); assert.equal(customer.reply_to,'jiatour@hotmail.com');
  assert.equal(customer.from,'Jia Tour <enquiries@jiatour.com.au>');
  assert(customer.html.includes('Alex &lt;Test&gt;')); assert(!customer.html.includes('<script>'));
  assert(customer.html.includes('https://www.jiatour.com.au/assets/email-logo.png'));
  assert(!customer.html.includes('sample-campaign')); assert(business.text.includes('sample-campaign'));
  assert.equal(calls[1].options.headers['Idempotency-Key'],'jiatour-'+fixture.requestId);
});

test('denies untrusted and missing origins before any external call',async()=>{
  for(const origin of ['https://evil.example','null','']){
    const {worker,calls}=harness(); assert.equal((await worker.fetch(request(fixture,{origin}),env)).status,403); assert.equal(calls.length,0);
  }
});

test('fails closed while disabled or any secret is missing',async()=>{
  for(const config of [{}, {...env,ENQUIRIES_ENABLED:'false'}, {...env,RESEND_API_KEY:''}, {...env,TURNSTILE_SECRET_KEY:''}]) {
    const {worker,calls}=harness(); assert.equal((await worker.fetch(request(),config)).status,503); assert.equal(calls.length,0);
  }
});

test('invalid fields and honeypot cannot trigger delivery',async()=>{
  for(const patch of [{email:'x@example.com\r\nBcc:y@example.com'},{Passengers:'0'},{Passengers:'1001'},{Journey:'invented'},{Vehicle:'unknown'},{Date:'2027-02-30'},{Date:'2020-01-01'},{_honey:'bot'},{Name:'x'.repeat(121)},{Notes:'x'.repeat(5001)},{requestId:'bad'},{turnstileToken:''},{Phone:'abc'},{Name:['Alex']}]) {
    const {worker,calls}=harness(); const result=await worker.fetch(request({...fixture,...patch}),env);
    assert.equal(result.status,400,JSON.stringify(patch).slice(0,80)); assert.equal(calls.length,0);
  }
});

test('malformed and oversized bodies are rejected without provider calls',async()=>{
  const {worker,calls}=harness();
  for(const body of ['{', '[]']) {
    const r=new Request('https://example.workers.dev/enquiry',{method:'POST',headers:{Origin:'https://www.jiatour.com.au','Content-Type':'application/json'},body});
    assert.equal((await worker.fetch(r,env)).status,400);
  }
  assert.equal((await worker.fetch(request({...fixture,Notes:'x'.repeat(30000)}),env)).status,413);
  assert.equal(calls.length,0);
});

test('challenge failure, wrong hostname and wrong action all block the sender',async()=>{
  for(const challenge of [{success:false},{...goodChallenge,hostname:'evil.example'},{...goodChallenge,hostname:'jiatour.com.au'},{...goodChallenge,action:'login'}]) {
    const {worker,calls}=harness({challenge}); assert.equal((await worker.fetch(request(),env)).status,403); assert.equal(calls.length,1);
  }
});

test('provider failure or incomplete acceptance never claims success or leaks details',async()=>{
  for(const options of [{mailStatus:429,mail:{message:'private provider detail'}},{mailStatus:500},{mail:{data:[{id:'one-only'}]}},{throws:true}]) {
    const {worker}=harness(options); const r=await worker.fetch(request(),env);
    assert(r.status>=400); const body=await r.text(); assert(!body.includes('private provider detail')); assert(!body.includes('mock-resend-key')); assert.equal(JSON.parse(body).ok,false);
  }
});

test('identical enquiry retries reuse a byte-identical pair and idempotency header',async()=>{
  const {worker,calls}=harness();
  await worker.fetch(request(),env);
  await worker.fetch(request({...fixture,turnstileToken:'new-token-after-reset'}),env);
  assert.equal(calls[1].options.body,calls[3].options.body);
  assert.equal(calls[1].options.headers['Idempotency-Key'],calls[3].options.headers['Idempotency-Key']);
});

test('preflight and health never send email or disclose configured values',async()=>{
  const {worker,calls}=harness();
  const preflight=new Request('https://example.workers.dev/enquiry',{method:'OPTIONS',headers:{Origin:'https://www.jiatour.com.au','Access-Control-Request-Method':'POST'}});
  const result=await worker.fetch(preflight,env); assert.equal(result.status,204); assert.equal(result.headers.get('Access-Control-Allow-Origin'),'https://www.jiatour.com.au');
  const health=await worker.fetch(request(fixture,{method:'GET',path:'/health'}),env);
  assert.deepEqual(await health.json(),{service:'Jia Tour enquiries',ready:true}); assert.equal(calls.length,0);
});

test('only JSON POST is accepted; customer cannot override routing or sender',async()=>{
  const {worker,calls}=harness();
  assert.equal((await worker.fetch(request(fixture,{type:'text/plain'}),env)).status,415);
  assert.equal((await worker.fetch(request(fixture,{method:'GET'}),env)).status,405);
  await worker.fetch(request({...fixture,to:'attacker@example.com',from:'attacker@example.com',html:'bad',_subject:'override'}),env);
  const payload=JSON.parse(calls[1].options.body);
  assert(payload.every(item=>item.from==='Jia Tour <enquiries@jiatour.com.au>'));
  assert.deepEqual(payload[0].to,['jiatour@hotmail.com']); assert.deepEqual(payload[1].to,['alex@example.com']);
  assert(!payload.some(item=>item.subject==='override'));
});
