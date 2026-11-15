# Jia Tour branded enquiry sender — integration staged

The production website on GitHub Pages still posts to FormSubmit. The `feat/branded-enquiry-form` branch prepares its replacement; merging this branch to `main` will switch the live form. The owner reports Resend has verified `jiatour.com.au` in Tokyo. Public DNS checks found the new DKIM TXT record and the two CNAME records (`rsend` and `send`) on 15 November 2026.

The owner created `jiatour-enquiries` at `https://jiatour-enquiries.tiho-largaux.workers.dev/` and provided the public Turnstile site key `0x4AAAAAAGBmhQ-OOyapcLjs`. A production-settings screenshot shows `ENQUIRIES_ENABLED` as the string `true`, with `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` stored as encrypted secrets. Secret values have not been shared or inspected. An external read-only health check was blocked with HTTP 403 / Cloudflare 1010; the owner must check `/health` in her own browser. A ready response proves configuration presence, not valid credentials or delivery.

Frontend integration, CSP changes, the public privacy notice and local mocked tests are prepared in this branch. No real enquiry email has been sent as part of this integration. Production cutover and inbox verification remain outstanding.

## Prepared backend

Deploy `worker.upload.mjs` as a Cloudflare Worker ES module. Rebuild it from the source and existing branded email renderer with `node _server/build.mjs`. The Worker runs without npm dependencies, a database, or changes to the site's nameservers. It accepts JSON at `POST /enquiry` from the two Jia Tour HTTPS origins, bounds request and field sizes, validates the trip and Melbourne date, and validates Turnstile server-side with the exact hostname and `enquiry` action. Origin checks are not treated as a substitute for Turnstile.

A Resend batch submits the business notification to `jiatour@hotmail.com` and the branded customer acknowledgement together. The sender is `Jia Tour <enquiries@jiatour.com.au>`; customer replies go to Hotmail, and business notification replies go to the customer's validated email. No receiving mailbox is created at the sending address. The customer email uses the public PNG logo because Resend batch attachments are not supported. Campaign labels are present only in the internal notification.

The Worker does not store enquiry bodies or log secrets/contact details. Cloudflare and Resend process requests and may retain provider logs. The staged public enquiry privacy notice describes these providers and Resend's US account-data storage. Provider acceptance is not proof of delivery.

## Dashboard configuration reference

1. Create a Resend API key named `Jia Tour Website`, permission **Sending access**, domain restricted to **jiatour.com.au**. Keep its value out of chat, screenshots, code and GitHub; paste it only into the Worker's secret setting below. Resend shows it once.
2. Sign into/create a Cloudflare account and create a Worker, suggested name `jiatour-enquiries`. A `workers.dev` endpoint is sufficient; retain VentraIP DNS and GitHub Pages hosting.
3. Paste the complete generated module into the Worker editor and deploy. It starts disabled and fails closed without required configuration.
4. Create a Managed Turnstile widget for `jiatour.com.au` and `www.jiatour.com.au`. Retain the public site key for the website. Put its secret key in the Worker, not the frontend.
5. In Worker Settings > Variables and Secrets, add **Secret** `RESEND_API_KEY` and **Secret** `TURNSTILE_SECRET_KEY`. Add text variable `ENQUIRIES_ENABLED` with value `true` only when ready for controlled delivery testing. Deploy changes.
6. Provide the public Worker HTTPS URL and public Turnstile site key for frontend integration. Never provide secret values.

## Work before activation

- Confirm `/health` returns HTTP 200 and `{"service":"Jia Tour enquiries","ready":true}` in the owner's browser. Do not change the variable type merely because the dashboard list labels plaintext strings as `Variable`.
- Review and visually verify the staged frontend before production cutover. `assets/enquiry.js` replaces native submission with JSON fetch, renders Turnstile with action `enquiry`, keeps an idempotency ID for retries of identical data, resets failed challenges and retains entered data. It only shows success when the Worker confirms the matching request ID. It never falls back automatically to a second email provider after an ambiguous timeout. The staged homepage removes old FormSubmit fields, updates the CSP and includes a contact fallback and matching privacy notice.
- Client data contract: all trip fields are strings with current form names (`Name`, `email`, `Phone`, `Journey`, `Date`, `Passengers`, `Vehicle`, `Pickup`, `Destination`, `Notes`). Optional campaign keys: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`.
- Test a real controlled submission with the owner's chosen test recipient and inspect both recipient inboxes, email headers, Gmail/Outlook/mobile layout, and duplicate retry behaviour. The mock tests only verify code, not external delivery.
- Monitor provider quotas, failed/bounced email events and abuse before and after launch. Two messages consume two units of the sending quota. Resend deduplication lasts 24 hours; this simple endpoint has no persistent queue, automated retry scheduler, or global per-user rate limiter. Turnstile and provider quotas are its current abuse controls; add a rate-limit binding/WAF rule if traffic warrants it.

Run local checks: `node --test _server/enquiry-worker.test.mjs`, `node _server/build.mjs`, `node --check _server/worker.upload.mjs`.

Frontend behaviour checks: install Happy DOM in a separate QA environment and run `JIATOUR_DOM_MODULE=/absolute/path/to/happy-dom/lib/index.js node --test _server/enquiry-form.test.mjs`. The 9 frontend checks and 10 Worker checks passed on 15 November 2026. All challenge callbacks and sending-provider requests are mocks: these results are not evidence of live Turnstile validation or email delivery.
