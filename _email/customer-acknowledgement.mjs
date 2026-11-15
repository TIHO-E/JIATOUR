// Prepared HTML/text only. This module does not send mail and is not used by the live form.
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const clean = (value, limit = 250) => String(value ?? '').trim().slice(0, limit);

export function renderAcknowledgement(enquiry = {}) {
  const name = clean(enquiry.Name, 120);
  const greeting = name ? `Hi ${name},` : 'Hello,';
  const fields = [
    ['Trip', clean(enquiry.Journey)],
    ['Travel date', clean(enquiry.Date)],
    ['Passengers', clean(enquiry.Passengers)],
    ['Preferred vehicle', clean(enquiry.Vehicle)],
    ['Pickup', clean(enquiry.Pickup)],
    ['Destination', clean(enquiry.Destination)],
    ['Your notes', clean(enquiry.Notes, 5000)]
  ].filter(([, value]) => value);
  const rowHtml = fields.map(([label, value]) => `<tr><th scope="row" align="left" valign="top" width="38%" style="padding:11px 14px;border-bottom:1px solid #e2e6e4;font-size:13px;font-weight:400;color:#62717a;">${label}</th><td valign="top" style="padding:11px 14px;border-bottom:1px solid #e2e6e4;font-size:14px;color:#132c3c;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>')}</td></tr>`).join('\n');
  const subject = 'We’ve received your enquiry | Jia Tour';
  const text = `${greeting}\n\nThank you for getting in touch. We’ve received your transport enquiry, and our team will review the details and contact you about availability and a quote.\n\n${fields.length ? 'YOUR TRIP AT A GLANCE\n' + fields.map(([label, value]) => `${label}: ${value}`).join('\n') + '\n\n' : ''}WHAT HAPPENS NEXT?\nWe’ll check your trip requirements and discuss the options with you. This is an acknowledgement only; your booking is not yet confirmed.\n\nNeed to update your trip?\nEmail jiatour@hotmail.com or call 0430 218 539.\n\nKind regards,\nThe Jia Tour team\nMelbourne Bus & Coach Charter\nhttps://www.jiatour.com.au/`;
  const html = `<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="robots" content="noindex,nofollow"><title>${subject}</title>
<style>body{margin:0!important;padding:0!important}table{border-collapse:collapse}a{color:#132c3c}@media(max-width:620px){.outer{padding:16px 10px!important}.content{padding:26px 22px!important}.brand{padding:24px 22px!important}.title{font-size:30px!important}.footer{padding:24px 22px!important}}</style>
</head><body style="margin:0;padding:0;background:#f0f2ef;font-family:Arial,Helvetica,sans-serif;color:#132c3c;line-height:1.65;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">Thank you for getting in touch. Our team will review your journey and be in touch.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f2ef;"><tr><td class="outer" align="center" style="padding:36px 16px;">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;">
<tr><td class="brand" style="padding:26px 36px;background:#132c3c;border-bottom:3px solid #e6bb72;">
<a href="https://www.jiatour.com.au/" style="color:#ffffff;text-decoration:none;font-size:23px;font-weight:700;letter-spacing:3px;">JIA TOUR</a>
<p style="margin:3px 0 0;color:#e6bb72;font-size:10px;font-weight:600;letter-spacing:2px;">MELBOURNE BUS &amp; COACH CHARTER</p></td></tr>
<tr><td class="content" style="padding:32px 36px;">
<p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:2px;color:#7b622f;">ENQUIRY RECEIVED</p>
<h1 class="title" style="margin:0 0 24px;font-size:34px;line-height:1.16;font-weight:600;letter-spacing:-1px;color:#132c3c;">Your journey starts here.</h1>
<p style="margin:0 0 10px;font-size:15px;">${escapeHtml(greeting)}</p>
<p style="margin:0 0 25px;font-size:15px;color:#4d5f69;">Thank you for getting in touch. We’ve received your transport enquiry, and our team will review the details and contact you about availability and a quote.</p>
${fields.length ? `<p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:1.6px;color:#62717a;">YOUR TRIP AT A GLANCE</p><table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f6f3;line-height:1.45;table-layout:fixed;">${rowHtml}</table>` : ''}
<h2 style="margin:25px 0 7px;font-size:18px;font-weight:600;color:#132c3c;">What happens next?</h2>
<p style="margin:0 0 10px;font-size:14px;color:#4d5f69;">We’ll check your trip requirements and discuss the options with you.</p>
<p style="margin:0 0 25px;font-size:12px;color:#62717a;">This is an acknowledgement only; your booking is not yet confirmed.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:20px 0;border-top:1px solid #e2e6e4;">
<p style="margin:0 0 12px;font-size:14px;font-weight:600;">Need to update your trip?</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#132c3c" style="border-radius:3px;"><a href="mailto:jiatour@hotmail.com" style="display:inline-block;padding:11px 20px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;">Email our team</a></td><td style="padding-left:18px;font-size:13px;"><a href="tel:+61430218539" style="color:#132c3c;text-decoration:underline;white-space:nowrap;">0430 218 539</a></td></tr></table>
<p style="margin:12px 0 0;font-size:12px;"><a href="mailto:jiatour@hotmail.com" style="color:#62717a;text-decoration:none;">jiatour@hotmail.com</a></p></td></tr></table>
<p style="margin:0;font-size:14px;color:#4d5f69;">Kind regards,<br><strong style="color:#132c3c;">The Jia Tour team</strong></p>
</td></tr>
<tr><td class="footer" style="padding:22px 36px;background:#f8f7f3;border-top:1px solid #e8e7e1;">
<p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:1.5px;color:#7b622f;">SAFE. RELIABLE. PROFESSIONAL.</p>
<p style="margin:0;font-size:12px;color:#62717a;">Jia Tour Pty Ltd · Melbourne, Victoria<br><a href="https://www.jiatour.com.au/" style="color:#132c3c;text-decoration:none;">www.jiatour.com.au</a></p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
  return { subject, text, html };
}
