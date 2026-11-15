# Jia Tour website maintenance

Production: https://www.jiatour.com.au/
Source: https://github.com/TIHO-E/JIATOUR

This is a buildless static website. Keep the existing GitHub Pages custom domain and CNAME. Publish the HTML pages, assets, robots.txt and sitemap.xml at the repository root. No account, tracking tag or paid advertising campaign is created by this update.

## Form delivery

The quote form POSTs to the existing FormSubmit recipient, jiatour@hotmail.com. CAPTCHA is enabled by default; a honeypot adds another spam check. The page never shows an email-delivered message merely because a submit button was clicked. The thank-you page is only a landing page, not an independently verified delivery receipt.

Delivery acceptance still requires the business to send one clearly labelled test enquiry through the live form, complete the provider's verification, activate the recipient if FormSubmit requests it, and confirm inbox or junk-folder receipt. Confirm all trip details arrive and any campaign attribution appears in the business notification subject. Do not launch paid ads until that is confirmed. No test email was sent during offline/browser validation.

## Automatic customer acknowledgements

The `_autoresponse` field sends a fixed English acknowledgement and FormSubmit’s copy of the submission to the visitor’s required `email` field. It thanks the customer, explains that availability and the quote will be reviewed, clearly excludes booking confirmation, and provides the business phone and email for follow-up. It does not promise a fixed response time or generate prices/availability.

Keep the native POST submission, CAPTCHA enabled and the input named `email`: FormSubmit documents that autoresponses do not work with AJAX or disabled CAPTCHA. The acknowledgement is sent by the form provider; do not assume it is sent from the business Hotmail address. This applies to website form submissions only, not messages sent directly to the Hotmail inbox.

The owner supplied a received customer acknowledgement on 15 November 2026, confirming that the original auto reply reached their test customer inbox. It also showed that FormSubmit collapses message line breaks and uses its own customer receipt layout despite `_template=table`. Business-inbox delivery and the updated receipt have not yet been confirmed by an end-to-end email test. No new test email was sent during this update.

The live message is now concise, the trip fields use readable single-word labels, and blank optional answers are omitted where the browser supports the formdata event. Campaign fields are no longer separate customer-facing rows. `_template=table` remains for provider notifications; do not claim it controls the customer autoresponse layout.

A separate branded HTML email is prepared in `_email/` for a future transactional email integration. It is NOT connected to the live form. Do not paste HTML into `_autoresponse`: the provider documentation does not document support for a fully custom HTML autoresponse. See `_email/README.md` for the remaining integration requirements.

## Promotion links

Use these URLs as the website links on the business's own profiles or approved campaigns. Non-empty campaign labels appear in the business notification subject (source, medium, campaign and content, up to 80 characters each). They are excluded from the customer field list; direct visits add no campaign data. They do not count page views, phone calls or conversions. Do not include personal data in campaign labels.

| Placement | URL |
| --- | --- |
| Google Business Profile website | https://www.jiatour.com.au/?utm_source=google&utm_medium=organic&utm_campaign=business_profile |
| Facebook post/profile | https://www.jiatour.com.au/?utm_source=facebook&utm_medium=social&utm_campaign=charter |
| Instagram profile | https://www.jiatour.com.au/?utm_source=instagram&utm_medium=social&utm_campaign=charter |
| WeChat share | https://www.jiatour.com.au/?utm_source=wechat&utm_medium=social&utm_campaign=charter |
| Email signature | https://www.jiatour.com.au/?utm_source=email&utm_medium=signature&utm_campaign=charter |
| Google Ads destination (only after an authorised campaign exists) | https://www.jiatour.com.au/?utm_source=google&utm_medium=cpc&utm_campaign=charter#quote |

Canonical metadata, descriptive copy, Open Graph/Twitter previews, Organization/Service JSON-LD and a sitemap are included. The schema uses only published business information; no street address, ratings, reviews or opening hours have been invented. SEO configuration does not guarantee indexing or ranking.

## Account connections still needed

- Business owner must provide/confirm the actual Google Business Profile and official social profile URLs before social-profile links are added to the site. Search did not establish a verified profile.
- Verify Search Console ownership using the owner's account, then submit https://www.jiatour.com.au/sitemap.xml. Do not create a second business listing without checking ownership of the existing one.
- GA4, Google Ads and Meta Pixel are not installed. Only configure them with confirmed account/measurement IDs, purpose and an appropriate privacy/consent setup.
- Paid campaign platform, geography and budget must be specified before launch. No advertising spend is authorised here.

## Content upkeep

The operator number, fleet capacities, phone, email and driver experience were carried forward from the original site. Have the business advise of changes. The previous version's dated legislative-compliance sentence was removed rather than publishing an unverified current compliance claim.

## Validation

Check all page anchors, image loading, menu keyboard behavior, vehicle/service selection, required fields, date/number/email validation, campaign capture, privacy/thank-you links, and narrow mobile layouts before publishing. Do not treat simulated submission or provider acceptance as proof of inbox delivery.

## Visual palette

The navigation retains the approved navy and gold. The homepage uses champagne for the trust strip, warm ivory for services, midnight navy for the fleet, pale mineral green for the introduction, warm porcelain for FAQs, and slate blue around the ivory enquiry form. Gold is the accent on dark surfaces; darker bronze is used for small text on light surfaces. Keep the full-width wrappers around services and FAQs, and check text contrast when changing colours.
