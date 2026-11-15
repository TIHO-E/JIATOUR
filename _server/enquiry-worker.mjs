// Prepared Cloudflare Worker. The live website still posts to FormSubmit.
import { renderAcknowledgement } from '../_email/customer-acknowledgement.mjs';

const ORIGINS = new Set(['https://www.jiatour.com.au', 'https://jiatour.com.au']);
const HOSTNAMES = new Set(['www.jiatour.com.au', 'jiatour.com.au']);
const BUSINESS_EMAIL = 'jiatour@hotmail.com';
const SENDER = 'Jia Tour <enquiries@jiatour.com.au>';
const MAX_BYTES = 24576;
const JOURNEYS = new Set(['Airport transfer', 'School & education', 'Corporate & events', 'Private group & wedding', 'Snow trip', 'Interstate trip', 'Tour & day trip', 'Travel agency & inbound group', 'Other']);
const VEHICLES = new Set(['Help me choose', '7–14 seats', '24 seats', '34 seats', '57 seats']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const htmlEscape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));

class InputError extends Error {
  constructor(code, status = 400) { super(code); this.status = status; }
}

function reply(origin, status, body) {
  const headers = {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Vary':'Origin'};
  if (ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return new Response(JSON.stringify(body), {status, headers});
}

async function readJson(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw new InputError('request_too_large', 413);
  if (!request.body) throw new InputError('invalid_request');
  const reader = request.body.getReader();
  const chunks = []; let length = 0;
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) { await reader.cancel(); throw new InputError('request_too_large', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const data = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(bytes));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch { throw new InputError('invalid_request'); }
}

function field(data, key, max, required = false, multiline = false) {
  if (data[key] !== undefined && typeof data[key] !== 'string') throw new InputError('invalid_' + key);
  const value = (data[key] || '').trim();
  if ((required && !value) || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (!multiline && /[\r\n\t]/.test(value))) throw new InputError('invalid_' + key);
  return value;
}

function normalize(data, now) {
  if (field(data, '_honey', 500)) throw new InputError('invalid_request');
  const requestId = field(data, 'requestId', 36, true);
  if (!UUID.test(requestId)) throw new InputError('invalid_requestId');
  const token = field(data, 'turnstileToken', 2048, true);
  const enquiry = {
    Name: field(data, 'Name', 120, true),
    email: field(data, 'email', 254, true),
    Phone: field(data, 'Phone', 50, true),
    Journey: field(data, 'Journey', 100, true),
    Date: field(data, 'Date', 10),
    Passengers: field(data, 'Passengers', 4, true),
    Vehicle: field(data, 'Vehicle', 50) || 'Help me choose',
    Pickup: field(data, 'Pickup', 250, true),
    Destination: field(data, 'Destination', 250, true),
    Notes: field(data, 'Notes', 5000, false, true)
  };
  if (!EMAIL.test(enquiry.email)) throw new InputError('invalid_email');
  if (enquiry.Phone.replace(/\D/g, '').length < 6) throw new InputError('invalid_Phone');
  if (!JOURNEYS.has(enquiry.Journey)) throw new InputError('invalid_Journey');
  if (!VEHICLES.has(enquiry.Vehicle)) throw new InputError('invalid_Vehicle');
  if (!/^[1-9]\d{0,3}$/.test(enquiry.Passengers) || Number(enquiry.Passengers) > 1000) throw new InputError('invalid_Passengers');
  if (enquiry.Date) {
    const parsed = new Date(enquiry.Date + 'T12:00:00Z');
    const parts = new Intl.DateTimeFormat('en-AU', {timeZone:'Australia/Melbourne', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now);
    const get = type => parts.find(p => p.type === type).value;
    const today = `${get('year')}-${get('month')}-${get('day')}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(enquiry.Date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== enquiry.Date || enquiry.Date < today) throw new InputError('invalid_Date');
  }
  const campaign = Object.fromEntries(['utm_source','utm_medium','utm_campaign','utm_content'].map(key => [key, field(data, key, 80)]).filter(([,value]) => value));
  return {requestId, token, enquiry, campaign};
}

function messages(enquiry, campaign) {
  const receipt = renderAcknowledgement(enquiry);
  const rows = [...Object.entries(enquiry).filter(([,v]) => v), ...Object.entries(campaign)];
  const summary = rows.map(([key,value]) => `${key}: ${value}`).join('\n');
  const table = rows.map(([key,value]) => `<tr><th align="left" valign="top" style="padding:10px;border-bottom:1px solid #ddd;">${htmlEscape(key)}</th><td style="padding:10px;border-bottom:1px solid #ddd;white-space:pre-wrap;overflow-wrap:anywhere;">${htmlEscape(value)}</td></tr>`).join('');
  return [
    {from:SENDER, to:[BUSINESS_EMAIL], reply_to:enquiry.email, subject:'Jia Tour | New charter quote enquiry', text:`New website enquiry\n\n${summary}`, html:`<!doctype html><html lang="en"><body style="font-family:Arial,sans-serif;color:#132c3c;"><h1>New website enquiry</h1><table style="border-collapse:collapse;width:100%;max-width:700px;">${table}</table></body></html>`},
    {from:SENDER, to:[enquiry.email], reply_to:BUSINESS_EMAIL, subject:receipt.subject, text:receipt.text, html:receipt.html}
  ];
}

async function fetchJson(fetcher, url, options) {
  const response = await fetcher(url, {...options, signal:AbortSignal.timeout(12000)});
  let body = null;
  try { body = await response.json(); } catch { /* Untrusted provider response is never returned to the visitor. */ }
  return {response, body};
}

export function createWorker({fetcher = fetch, now = () => new Date()} = {}) {
  return {async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const ready = env.ENQUIRIES_ENABLED === 'true' && Boolean(env.RESEND_API_KEY) && Boolean(env.TURNSTILE_SECRET_KEY);
    if (url.pathname === '/health' && request.method === 'GET') return reply(origin, ready ? 200 : 503, {service:'Jia Tour enquiries', ready});
    if (url.pathname !== '/enquiry') return reply(origin, 404, {ok:false, code:'not_found'});
    if (!ORIGINS.has(origin)) return reply(origin, 403, {ok:false, code:'origin_not_allowed'});
    if (request.method === 'OPTIONS') {
      if (request.headers.get('Access-Control-Request-Method') !== 'POST') return reply(origin, 405, {ok:false, code:'method_not_allowed'});
      return new Response(null, {status:204, headers:{'Access-Control-Allow-Origin':origin, 'Access-Control-Allow-Methods':'POST', 'Access-Control-Allow-Headers':'Content-Type', 'Access-Control-Max-Age':'600', 'Vary':'Origin'}});
    }
    if (request.method !== 'POST') return reply(origin, 405, {ok:false, code:'method_not_allowed'});
    if (!ready) return reply(origin, 503, {ok:false, code:'temporarily_unavailable'});
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return reply(origin, 415, {ok:false, code:'unsupported_content_type'});
    try {
      const {requestId, token, enquiry, campaign} = normalize(await readJson(request), now());
      const verification = {secret:env.TURNSTILE_SECRET_KEY, response:token};
      const ip = request.headers.get('CF-Connecting-IP');
      if (ip) verification.remoteip = ip;
      const checked = await fetchJson(fetcher, 'https://challenges.cloudflare.com/turnstile/v0/siteverify', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(verification)});
      if (!checked.response.ok || !checked.body) return reply(origin, 503, {ok:false, code:'verification_unavailable'});
      if (checked.body.success !== true || !HOSTNAMES.has(checked.body.hostname) || checked.body.hostname !== new URL(origin).hostname || checked.body.action !== 'enquiry') return reply(origin, 403, {ok:false, code:'verification_required'});
      const payload = messages(enquiry, campaign);
      // The browser retains this UUID while retrying the same enquiry. Resend
      // deduplicates the whole pair for 24 hours, including an uncertain timeout.
      const sent = await fetchJson(fetcher, 'https://api.resend.com/emails/batch', {method:'POST', headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`, 'Content-Type':'application/json', 'Idempotency-Key':`jiatour-${requestId}`}, body:JSON.stringify(payload)});
      if (!sent.response.ok) return reply(origin, sent.response.status === 429 ? 429 : 502, {ok:false, code:'sending_unavailable'});
      if (!Array.isArray(sent.body?.data) || sent.body.data.length !== 2 || !sent.body.data.every(item => typeof item.id === 'string' && item.id)) return reply(origin, 502, {ok:false, code:'sending_unconfirmed'});
      // Accepted by the email provider, not proof of inbox delivery or a booking.
      return reply(origin, 200, {ok:true, requestId});
    } catch (error) {
      if (error instanceof InputError) return reply(origin, error.status, {ok:false, code:error.message});
      return reply(origin, 503, {ok:false, code:'temporarily_unavailable'});
    }
  }};
}

export default createWorker();
