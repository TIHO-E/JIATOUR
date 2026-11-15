# Jia Tour website maintenance

Production: https://www.jiatour.com.au/
Source: https://github.com/TIHO-E/JIATOUR

This is a buildless static website. Keep the existing GitHub Pages custom domain and CNAME. Publish the HTML pages, assets, robots.txt and sitemap.xml at the repository root. No account, tracking tag or paid advertising campaign is created by this update.

## Form delivery and automatic acknowledgements

The homepage submits JSON to `https://jiatour-enquiries.tiho-largaux.workers.dev/enquiry`. Cloudflare Turnstile protects the form, and the Worker checks the token, hostname, action, origins and enquiry fields before sending a Resend batch. FormSubmit's action and autoresponse fields have been removed, so the website does not send two customer receipts through different providers.

Each accepted enquiry sends two messages:

- Business notification to `jiatour@hotmail.com`, with Reply-To set to the validated customer email.
- Branded customer acknowledgement from `Jia Tour <enquiries@jiatour.com.au>`, with Reply-To set to `jiatour@hotmail.com`. The navy/gold HTML contains the company logo, greeting, readable trip summary and a clear statement that this is not a quotation or booking confirmation. A plain-text alternative is included.

The frontend retains entered data on failure and keeps the same idempotency ID for retries of identical data. It only shows success after a matching positive Worker response; email-provider acceptance is not proof of inbox delivery. No fallback provider is called automatically after an ambiguous timeout. This applies to website enquiries, not messages sent directly to the Hotmail inbox.

On 15 November 2026 the owner submitted a controlled enquiry on the test page and supplied the actual received customer `.eml`. It confirms the new sender, Hotmail Reply-To, logo URL and branded HTML, with Gmail reporting SPF, DKIM and DMARC pass. The received HTML was checked at desktop and mobile widths with test fields redacted. This confirms customer-side delivery for that test; business-inbox delivery and Outlook-client rendering have not been independently confirmed. The owner should also check Hotmail for `Jia Tour | New charter quote enquiry` and monitor later delivery/bounce events.

The former owner test URLs redirect to the live enquiry section and privacy notice. Backend setup, security boundaries and test commands are documented in `_server/README.md`. The email renderer is documented in `_email/README.md`. Never put API keys or Turnstile secret keys into frontend files, screenshots or GitHub.

## Promotion links

Use these URLs as the website links on the business's own profiles or approved campaigns. Non-empty campaign labels appear in the business notification body (source, medium, campaign and content, up to 80 characters each). They are excluded from the customer field list; direct visits add no campaign data. They do not count page views, phone calls or conversions. Do not include personal data in campaign labels.

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

The 15 November 2026 search update adds a `/services/` directory and eight service-specific landing pages, with ten sitemap URLs in total. Edit their content in `_seo/services.json` and regenerate with `node _seo/build.mjs`; commit generated HTML too. The five approved top-bar anchors remain unchanged. Service rows now open detailed service pages, whose quote links preselect the matching journey on the original form. See `_seo/README.md` for implementation details and `_seo/PROMOTION.md` for owner-ready promotion links and setup instructions.

The four campaign labels now follow same-origin internal links without cookies or browser storage, so landing on a service page does not lose the source before an enquiry. This does not add visitor analytics or infer a source for untagged visits. Twelve local mocked frontend/navigation checks passed; live inbox delivery is not part of these tests.

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

## Typography

The page content uses self-hosted Manrope with upright bold headings. The top bar follows the supplied Jia Tour Coaches reference: compact bold Arial/Helvetica lettering, a white JIATOUR / gold COACHES wordmark, a square white logo tile and gold navigation on deep navy. Keep the existing five navigation destinations. The header is 80 px on desktop and 72 px on mobile. Footer home links on all public content pages use a gold JIATOUR / COACHES wordmark without a logo image. The earlier decorative serif files are retained but are not loaded by the website. `assets/typography.css` owns the size scale, weights, line lengths and responsive adjustments; load it after `assets/site.css`. Font files and original SIL licences are in `assets/fonts/`. Main text is generally 16–18 px, form inputs remain at least 16 px, and narrow screens use one fleet card per row to keep descriptions readable. Fonts use `font-display: swap`, system fallbacks, and no third-party font requests. The email template retains its mail-client-safe fonts.
