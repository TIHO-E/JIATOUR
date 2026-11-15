// GENERATED: run node _server/build.mjs; do not put secrets in this file.
// HTML/text renderer used by the Cloudflare enquiry Worker. It does not send mail itself.
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const clean = (value, limit = 250) => String(value ?? '').trim().slice(0, limit);

function renderAcknowledgement(enquiry = {}, { inlineLogo = false } = {}) {
  const name = clean(enquiry.Name, 120);
  const greeting = name ? `Dear ${name},` : 'Dear Customer,';
  const logo = inlineLogo ? 'cid:jiatour-logo' : 'https://www.jiatour.com.au/assets/email-logo.png';
  let date = clean(enquiry.Date, 80);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsed = new Date(`${date}T12:00:00Z`);
    if (Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date) {
      date = new Intl.DateTimeFormat('en-AU', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(parsed);
    }
  }
  const fields = [
    ['Trip', clean(enquiry.Journey)],
    ['Travel date', date],
    ['Passengers', clean(enquiry.Passengers)],
    ['Preferred vehicle', clean(enquiry.Vehicle)],
    ['Pickup', clean(enquiry.Pickup)],
    ['Destination', clean(enquiry.Destination)],
    ['Your notes', clean(enquiry.Notes, 5000)]
  ].filter(([, value]) => value);
  const rowHtml = fields.map(([label, value]) => `<tr><th scope="row" align="left" valign="top" width="38%" style="padding:11px 14px;border-bottom:1px solid #e2e6e4;font-size:13px;font-weight:400;color:#62717a;">${label}</th><td valign="top" style="padding:11px 14px;border-bottom:1px solid #e2e6e4;font-size:14px;color:#132c3c;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>')}</td></tr>`).join('\n');
  const subject = 'Jia Tour | Your transport enquiry has been received';
  const text = `${greeting}\n\nThank you for contacting Jia Tour. We have received your transport enquiry and look forward to helping you plan your journey.\n\nOur team will review your travel requirements and contact you to discuss vehicle availability and provide a tailored quotation.\n\n${fields.length ? 'YOUR ENQUIRY DETAILS\n' + fields.map(([label, value]) => `${label}: ${value}`).join('\n') + '\n\n' : ''}BOOKING STATUS\nThis email acknowledges your enquiry only. It is not a quotation or booking confirmation. Your vehicle, price and travel arrangements will be confirmed directly by our team.\n\nNeed to update your enquiry?\nReply to this email or contact jiatour@hotmail.com. For urgent enquiries, please call 0430 218 539.\n\nKind regards,\nJia Tour Team\nMelbourne Bus & Coach Charter\nhttps://www.jiatour.com.au/`;
  const html = `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="robots" content="noindex,nofollow"><title>${subject}</title>
<style>body{margin:0!important;padding:0!important}table{border-collapse:collapse}a{color:#132c3c}@media(max-width:620px){.outer{padding:16px 10px!important}.content{padding:26px 22px!important}.brand{padding:24px 22px!important}.title{font-size:30px!important}.footer{padding:24px 22px!important}}</style>
</head><body style="margin:0;padding:0;background:#f0f2ef;font-family:Arial,Helvetica,sans-serif;color:#132c3c;line-height:1.65;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">Thank you for getting in touch. Our team will review your journey and be in touch.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f2ef;"><tr><td class="outer" align="center" style="padding:36px 16px;">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;">
<tr><td class="brand" style="padding:26px 36px;background:#132c3c;border-bottom:3px solid #e6bb72;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td width="72" valign="middle"><a href="https://www.jiatour.com.au/" style="text-decoration:none;"><img src="${logo}" width="72" height="72" alt="Jia Tour logo" style="display:block;border:0;background:#fcfaf6;border-radius:8px;"></a></td><td valign="middle" style="padding-left:16px;"><a href="https://www.jiatour.com.au/" style="color:#e6bb72;text-decoration:none;font-size:22px;font-weight:700;letter-spacing:2px;">JIA TOUR</a><p style="margin:4px 0 0;color:#ead4b0;font-size:9px;font-weight:400;letter-spacing:1px;line-height:1.6;">MELBOURNE<br>BUS &amp; COACH CHARTER</p></td></tr></table></td></tr>
<tr><td class="content" style="padding:32px 36px;">
<p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;color:#7b622f;">ENQUIRY RECEIVED</p>
<h1 class="title" style="margin:0 0 24px;font-size:32px;line-height:1.2;font-weight:600;letter-spacing:-.8px;color:#132c3c;">Thank you for your enquiry.</h1>
<p style="margin:0 0 10px;font-size:15px;">${escapeHtml(greeting)}</p>
<p style="margin:0 0 14px;font-size:15px;color:#4d5f69;">Thank you for contacting Jia Tour. We have received your transport enquiry and look forward to helping you plan your journey.</p>
<p style="margin:0 0 25px;font-size:15px;color:#4d5f69;">Our team will review your travel requirements and contact you to discuss vehicle availability and provide a tailored quotation.</p>
${fields.length ? `<p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:1.6px;color:#826333;">YOUR ENQUIRY DETAILS</p><table width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5ee;border-top:2px solid #cfb17c;line-height:1.45;table-layout:fixed;">${rowHtml}</table>` : ''}
<h2 style="margin:23px 0 7px;font-size:12px;font-weight:700;color:#132c3c;">BOOKING STATUS</h2>
<p style="margin:0 0 25px;font-size:12px;line-height:1.6;color:#596870;">This email acknowledges your enquiry only. It is not a quotation or booking confirmation. Your vehicle, price and travel arrangements will be confirmed directly by our team.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:20px 0;border-top:1px solid #e2e6e4;">
<p style="margin:0 0 8px;font-size:16px;font-weight:600;">Need to update your enquiry?</p>
<p style="margin:0 0 15px;font-size:14px;color:#4d5f69;">Simply reply to this email. For urgent enquiries, please call our team.</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#132c3c" style="border-radius:3px;"><a href="mailto:jiatour@hotmail.com" style="display:inline-block;padding:11px 18px;font-size:13px;font-weight:600;color:#f2d5a4;text-decoration:none;">Email Jia Tour</a></td><td style="padding-left:16px;font-size:13px;"><a href="tel:+61430218539" style="color:#132c3c;text-decoration:underline;white-space:nowrap;">0430 218 539</a></td></tr></table>
</td></tr></table>
<p style="margin:0;font-size:14px;color:#4d5f69;">Kind regards,<br><strong style="color:#132c3c;">Jia Tour Team</strong><br><span style="font-size:12px;">Melbourne Bus &amp; Coach Charter</span></p>
</td></tr>
<tr><td class="footer" bgcolor="#132c3c" style="padding:23px 36px;background:#132c3c;border-top:2px solid #e6bb72;">
<p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:1.5px;color:#e6bb72;">SAFE. RELIABLE. PROFESSIONAL.</p>
<p style="margin:0;font-size:12px;line-height:1.8;color:#d0dbe0;">Jia Tour Pty Ltd · Melbourne, Australia<br><a href="mailto:jiatour@hotmail.com" style="color:#ead4b0;text-decoration:none;">jiatour@hotmail.com</a><br><a href="https://www.jiatour.com.au/" style="color:#ead4b0;text-decoration:none;">www.jiatour.com.au</a></p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
  return { subject, text, html };
}

// Cloudflare Worker for Jia Tour website enquiries and branded acknowledgements.

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

function createWorker({fetcher = fetch, now = () => new Date()} = {}) {
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
