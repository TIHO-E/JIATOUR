// Prepared HTML/text only. This module does not send mail and is not used by the live form.
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const clean = (value, limit = 250) => String(value ?? '').trim().slice(0, limit);

export function renderAcknowledgement(enquiry = {}, { inlineLogo = false } = {}) {
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
