# Jia Tour branded enquiry sender

The GitHub Pages homepage now uses the Cloudflare Worker at `https://jiatour-enquiries.tiho-largaux.workers.dev/enquiry` with Resend and a Managed Turnstile widget. The public widget site key is `0x4AAAAAAGBmhQ-OOyapcLjs`. The previous FormSubmit route has been removed from the homepage.

The owner verified the Resend domain `jiatour.com.au` in Tokyo, added its DKIM and sending CNAME records in VentraIP, deployed the Worker, and stored `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` as encrypted production secrets. `ENQUIRIES_ENABLED` is the string `true`. The owner supplied a successful `/health` response and then an actual received branded customer acknowledgement on 15 November 2026. Gmail reported SPF, DKIM and DMARC pass; Reply-To is `jiatour@hotmail.com`. No secret values have been shared or inspected.

Customer delivery is verified for that controlled test. The business inbox and Outlook rendering remain unverified independently. The temporary test pages now redirect to the live form and privacy notice. Received email files and customer details are excluded from the repository.

## Backend

Deploy `worker.upload.mjs` as a Cloudflare Worker ES module. Rebuild it from the source and existing branded email renderer with `node _server/build.mjs`. The Worker runs without npm dependencies, a database, or changes to the site's nameservers. It accepts JSON at `POST /enquiry` from the two Jia Tour HTTPS origins, bounds request and field sizes, validates the trip and Melbourne date, and validates Turnstile server-side with the exact hostname and `enquiry` action. Origin checks are not treated as a substitute for Turnstile.

A Resend batch submits the business notification to `jiatour@hotmail.com` and the branded customer acknowledgement together. The sender is `Jia Tour <enquiries@jiatour.com.au>`; customer replies go to Hotmail, and business notification replies go to the customer's validated email. No receiving mailbox is created at the sending address. The customer email uses the public PNG logo because Resend batch attachments are not supported. Campaign labels are present only in the internal notification.

The Worker does not store enquiry bodies or log secrets/contact details. Cloudflare and Resend process requests and may retain provider logs. The public enquiry privacy notice describes these providers and Resend's US account-data storage. Provider acceptance is not proof of delivery.

## Dashboard configuration reference

1. Create a Resend API key named `Jia Tour Website`, permission **Sending access**, domain restricted to **jiatour.com.au**. Keep its value out of chat, screenshots, code and GitHub; paste it only into the Worker's secret setting below. Resend shows it once.
2. Sign into/create a Cloudflare account and create a Worker, suggested name `jiatour-enquiries`. A `workers.dev` endpoint is sufficient; retain VentraIP DNS and GitHub Pages hosting.
3. Paste the complete generated module into the Worker editor and deploy. It starts disabled and fails closed without required configuration.
4. Create a Managed Turnstile widget for `jiatour.com.au` and `www.jiatour.com.au`. Retain the public site key for the website. Put its secret key in the Worker, not the frontend.
5. In Worker Settings > Variables and Secrets, add **Secret** `RESEND_API_KEY` and **Secret** `TURNSTILE_SECRET_KEY`. Add text variable `ENQUIRIES_ENABLED` with value `true` only when ready for controlled delivery testing. Deploy changes.
6. Provide the public Worker HTTPS URL and public Turnstile site key for frontend integration. Never provide secret values.

## Frontend and operational checks

- `/health` reports whether the three required settings are present. A ready response alone does not prove key validity or email delivery. Plaintext strings appear as `Variable` in the dashboard list.
- `assets/enquiry.js` submits JSON, renders Turnstile with action `enquiry`, keeps an idempotency ID for retries of identical data, resets failed challenges and retains entered data. It only shows success when the Worker confirms the matching request ID, and never falls back automatically to another sending provider after an ambiguous timeout.
- Client data contract: trip fields are strings named `Name`, `email`, `Phone`, `Journey`, `Date`, `Passengers`, `Vehicle`, `Pickup`, `Destination`, `Notes`. Optional campaign keys are `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. The payload also includes `_honey`, `turnstileToken` and a UUIDv4 `requestId`.
- After changing the Worker or email renderer, redeploy the generated bundle in Cloudflare; publishing GitHub Pages alone does not update the Worker. After any delivery change, use an owner-controlled test address and check both inboxes, headers and email-client layout. Do not send tests to arbitrary customers.
- Monitor provider quotas, failed/bounced email events and abuse. Each enquiry consumes two sent messages. Resend deduplication lasts 24 hours; this endpoint has no persistent queue, retry scheduler or global per-user rate limiter. Turnstile and provider quotas are the current abuse controls; add rate limiting if traffic warrants it.

Run local checks: `node --test _server/enquiry-worker.test.mjs`, `node _server/build.mjs`, `node --check _server/worker.upload.mjs`.

Frontend behaviour checks: install Happy DOM in a separate QA environment and run `JIATOUR_DOM_MODULE=/absolute/path/to/happy-dom/lib/index.js node --test _server/enquiry-form.test.mjs`. The 9 frontend checks and 10 Worker checks passed on 15 November 2026. All challenge callbacks and sending-provider requests are mocks: these results are not evidence of live Turnstile validation or email delivery.
