# Branded customer acknowledgement

`customer-acknowledgement.mjs` exports `renderAcknowledgement(enquiry)`, returning an email subject, plain-text alternative and responsive HTML. The Cloudflare enquiry Worker uses this renderer for website acknowledgements sent through Resend. It escapes customer content, omits missing trip fields and excludes contact/campaign data from the trip summary.

The active sender is `Jia Tour <enquiries@jiatour.com.au>` and Reply-To is `jiatour@hotmail.com`. This domain address is a verified sending identity, not a newly created receiving mailbox. Customer replies continue to go to Hotmail. The receipt does not promise availability, a price, a response deadline or a confirmed booking.

## Logo and layout

The template uses the company's existing logo, a navy/gold header and footer, a personalised salutation, a trip summary, booking-status note and contact links. `assets/email-logo.png` is a PNG conversion of the existing transparent logo, preserving its design. The current Resend batch uses the public HTTPS logo URL because batch attachments are not supported. Some email clients may require the recipient to allow remote images.

The renderer also supports `renderAcknowledgement(enquiry, {inlineLogo: true})` for a separately constructed MIME message with Content-ID `<jiatour-logo>`. Do not enable that option in the current batch integration without attaching the matching image through a supported sending path. Do not use a data URI for delivered email.

## Verification

On 15 November 2026 the owner supplied the actual branded customer `.eml` received after a controlled submission. Its headers confirm the Jia Tour sender, Hotmail reply destination, and Gmail SPF/DKIM/DMARC pass. The message includes HTML and plain-text alternatives, the public logo URL, and no FormSubmit wrapper or campaign fields. The received HTML was visually checked at desktop and mobile widths with customer fields redacted. This is customer-side delivery evidence for that test, not a guarantee of all future inbox delivery or verification of Outlook rendering.

`preview.html` uses fictional sample details and remains a design preview. No received `.eml`, customer address, secret or real enquiry data is committed to this repository. The underscore directory is excluded from the public website by the current default GitHub Pages/Jekyll build; revisit that assumption if the build configuration changes.

When changing the template, run `node _server/build.mjs`, validate the Worker tests and redeploy the generated Worker bundle through the owner's Cloudflare account. A GitHub Pages update alone cannot update the template already deployed inside the Worker.
