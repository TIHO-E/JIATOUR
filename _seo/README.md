# Jia Tour service pages

Edit `services.json` and run `node _seo/build.mjs` from the repository root. The generator writes eight static service pages, the service directory, the homepage service links and metadata, and `sitemap.xml`. Commit generated files along with their source. GitHub Pages serves these files without a JavaScript build step; the `_seo` source directory is not a public marketing page.

The generator reuses the homepage's approved navigation and footer. Homepage navigation still uses the five original anchors. On service pages, quote links return to the homepage with a whitelisted `trip` value, which `assets/site.js` uses to select the journey type. Service pages do not load a second enquiry form or Turnstile instance.

Search implementation:

- Ten indexable URLs: homepage, services directory, eight distinct services. Each has a canonical URL, title, description, social preview, one H1 and server-delivered text.
- Consistent Organization/WebSite identities. Individual pages add Service/WebPage/BreadcrumbList; the directory uses CollectionPage/ItemList. No unverified address, opening hours, prices, reviews, ratings or social profile identities.
- Useful visible planning information and three specific questions per service. No promise of FAQ rich-result eligibility, an AI citation or a particular ranking. There is no special AI schema or mandatory `llms.txt` dependency.
- Existing `robots.txt` allows crawling, including Googlebot, Bingbot and OAI-SearchBot. Training-crawler preferences are unchanged. Check hosting/firewall restrictions separately if infrastructure changes.
- Utility and test pages remain `noindex` and outside the sitemap.

Campaign handling forwards only `utm_source`, `utm_medium`, `utm_campaign` and `utm_content` between same-origin links. Values are stripped of control characters and limited to 80 characters. Arbitrary incoming query parameters, personal identifiers and ad click IDs are not copied. Existing destination labels take precedence. Hash-only links retain the current query string. No cookies, localStorage or sessionStorage are used. Canonical URLs never include campaign or trip parameters. Business notification capture remains in `assets/enquiry.js`.

This is enquiry attribution, not visitor analytics. It does not measure page views, phone calls, ad spend, cross-session visits or confirmed bookings. Browser back/forward and cross-domain visits may not retain the same attribution. Connect actual Search Console/Bing/analytics accounts for reporting; do not fabricate verification IDs.

Local functional checks:

```
JIATOUR_DOM_MODULE=/absolute/path/to/happy-dom/lib/index.js node --test _seo/navigation.test.mjs _server/enquiry-form.test.mjs
```

These mock tests send no mail. Check desktop and 320/390 px layouts, image loads, menu, FAQ disclosure, service-to-quote prefill and all sitemap links when changing templates.

Official implementation guidance reviewed on 15 November 2026:

- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.openai.com/api/docs/bots

See `PROMOTION.md` for owner-ready campaign URLs and account setup steps.
