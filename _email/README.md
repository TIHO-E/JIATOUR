# Branded customer acknowledgement — prepared, not active

`customer-acknowledgement.mjs` exports `renderAcknowledgement(enquiry)`, returning an email subject, plain-text alternative and responsive HTML. It escapes customer content, omits missing trip fields and excludes contact/campaign data from the trip summary. `preview.html` uses fictional sample trip details, not a customer record. It is a browser design preview, not evidence of delivery or mail-client rendering.

The live form still uses FormSubmit's built-in autoresponse. Its documented `_autoresponse` option accepts a custom message; the received test shows that message line breaks collapse and `_template=table` does not produce a branded customer receipt. The prepared HTML is deliberately not placed in that input.

To activate this design, connect a server-side transactional email service with a verified sending identity and a place to run the enquiry handler. The user needs to identify an existing mail/hosting account or set up the chosen service; keep credentials on the server. Set the sender display name to Jia Tour and Reply-To to jiatour@hotmail.com. The Hotmail address is the reply destination, not an authenticated custom-domain From address.

The handler must validate input, keep spam controls, deliver the business notification, render this template, send to the validated customer address, and handle/retry failures without duplicates. Keep campaign information in the internal notification only. Remove the old FormSubmit `_autoresponse` only after replacement delivery is working, to avoid sending two customer receipts. Update the privacy notice if processors change. Verify the business and customer inboxes plus Gmail/Outlook/mobile rendering before marking the branded email live.

No backend endpoint, sending credentials, DNS records or paid account has been created. No new test message was sent. These files are under an underscore directory so the current default GitHub Pages/Jekyll build excludes them from the public website; revisit that assumption if the build configuration changes.
