# Jia Tour branded enquiry sender — prepared, not active

The website is still on GitHub Pages and still posts to FormSubmit. These files do not switch the live form. The owner reports Resend has verified `jiatour.com.au` in Tokyo. Public DNS checks found the new DKIM TXT record and the two CNAME records (`rsend` and `send`) on 15 November 2026.

## Prepared backend

Deploy `worker.upload.mjs` as a Cloudflare Worker ES module. Rebuild it from the source and existing branded email renderer with `node _server/build.mjs`. The Worker runs without npm dependencies, a database, or changes to the site's nameservers. It accepts JSON at `POST /enquiry` from the two Jia Tour HTTPS origins, bounds request and field sizes, validates the trip and Melbourne date, and validates Turnstile server-side with the exact hostname and `enquiry` action. Origin checks are not treated as a substitute for Turnstile.

A Resend batch submits the business notification to `jiatour@hotmail.com` and the branded customer acknowledgement together. The sender is `Jia Tour <enquiries@jiatour.com.au>`; customer replies go to Hotmail, and business notification replies go to the customer's validated email. No receiving mailbox is created at the sending address. The customer email uses the public PNG logo because Resend batch attachments are not supported. Campaign labels are present only in the internal notification.

The Worker does not store enquiry bodies or log secrets/contact details. Cloudflare and Resend process requests and may retain provider logs. Before switching, update the public enquiry privacy notice to describe these providers and Resend's US account-data storage. Provider acceptance is not proof of delivery. No message has been sent by this Worker yet.

## Owner configuration still required

1. Create a Resend API key named `Jia Tour Website`, permission **Sending access**, domain restricted to **jiatour.com.au**. Keep its value out of chat, screenshots, code and GitHub; paste it only into the Worker's secret setting below. Resend shows it once.
2. Sign into/create a Cloudflare account and create a Worker, suggested name `jiatour-enquiries`. A `workers.dev` endpoint is sufficient; retain VentraIP DNS and GitHub Pages hosting.
3. Paste the complete generated module into the Worker editor and deploy. It starts disabled and fails closed without required configuration.
4. Create a Managed Turnstile widget for `jiatour.com.au` and `www.jiatour.com.au`. Retain the public site key for the website. Put its secret key in the Worker, not the frontend.
5. In Worker Settings > Variables and Secrets, add **Secret** `RESEND_API_KEY` and **Secret** `TURNSTILE_SECRET_KEY`. Add text variable `ENQUIRIES_ENABLED` with value `true` only when ready for controlled delivery testing. Deploy changes.
6. Provide the public Worker HTTPS URL and public Turnstile site key for frontend integration. Never provide secret values.

## Work before activation

- Replace the native FormSubmit POST with fetch to the confirmed Worker URL, render the Managed Turnstile widget with action `enquiry`, and send the validated fields, campaign labels, `_honey`, `turnstileToken` and a browser-generated `crypto.randomUUID()` requestId. Maintain the same ID for retries of identical enquiry data. Reset Turnstile after failures; keep entered data. Do not show success before `ok:true`. Clear an ID after success or edited enquiry data. Do not automatically send through a second provider after an ambiguous timeout.
- Adjust the website CSP for the specific endpoint and Cloudflare's Turnstile resources. Remove old FormSubmit auto-reply fields only when replacing the submission handler. Update the privacy notice and fallback contact copy together.
- Client data contract: all trip fields are strings with current form names (`Name`, `email`, `Phone`, `Journey`, `Date`, `Passengers`, `Vehicle`, `Pickup`, `Destination`, `Notes`). Optional campaign keys: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`.
- Test a real controlled submission with the owner's chosen test recipient and inspect both recipient inboxes, email headers, Gmail/Outlook/mobile layout, and duplicate retry behaviour. The mock tests only verify code, not external delivery.
- Monitor provider quotas, failed/bounced email events and abuse before and after launch. Two messages consume two units of the sending quota. Resend deduplication lasts 24 hours; this simple endpoint has no persistent queue, automated retry scheduler, or global per-user rate limiter. Turnstile and provider quotas are its current abuse controls; add a rate-limit binding/WAF rule if traffic warrants it.

Run local checks: `node --test _server/enquiry-worker.test.mjs`, `node _server/build.mjs`, `node --check _server/worker.upload.mjs`.
