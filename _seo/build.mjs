// Run from any directory: node _seo/build.mjs
// Generates committed static pages; GitHub Pages requires no runtime/build changes.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const services = JSON.parse(await readFile(new URL('services.json', import.meta.url), 'utf8'));
const base = 'https://www.jiatour.com.au';
const release = '20261115-search';
const reviewed = '2026-11-15';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = service => `/services/${service.slug}/`;
const quote = service => `/?trip=${encodeURIComponent(service.journey)}#quote`;
const arrow = '<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>';
const organization = {
  '@type':'Organization', '@id':`${base}/#business`, name:'Jia Tour', legalName:'Jia Tour Pty Ltd',
  url:`${base}/`, logo:`${base}/assets/logo.webp`, telephone:'+61430218539', email:'jiatour@hotmail.com',
  taxID:'66 672 569 452', areaServed:[{'@type':'City',name:'Melbourne'},{'@type':'State',name:'Victoria'},{'@type':'Country',name:'Australia'}],
  contactPoint:{'@type':'ContactPoint',contactType:'Charter enquiries',telephone:'+61430218539',email:'jiatour@hotmail.com'}
};
const website = {'@type':'WebSite','@id':`${base}/#website`,url:`${base}/`,name:'Jia Tour',inLanguage:'en-AU',publisher:{'@id':organization['@id']}};

let home = await readFile(path.join(root,'index.html'),'utf8');
let header = home.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
let footer = home.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
const rootLinks = html => html.replace(/href="#/g,'href="/#').replace(/(?:src|href)="(assets\/[^\"]+)"/g,(match,value)=>match.replace(value,`/${value}`)).replace(/href="privacy.html"/g,'href="/privacy.html"');
header = rootLinks(header);
footer = rootLinks(footer);
function head(title,description,canonical,graph){
  return `<!doctype html>\n<html lang="en-AU"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#202c44">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests">
<meta name="referrer" content="strict-origin-when-cross-origin"><meta name="robots" content="index, follow, max-image-preview:large">
<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:locale" content="en_AU"><meta property="og:site_name" content="Jia Tour"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${base}/assets/social-preview.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Victoria’s coastal scenery">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${base}/assets/social-preview.jpg">
<link rel="icon" href="/assets/favicon.png"><link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/site.css?v=20261115-receipt"><link rel="stylesheet" href="/assets/typography.css?v=20261115-title-cleanup"><link rel="stylesheet" href="/assets/services.css?v=${release}">
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>
<script src="/assets/site.js?v=${release}" defer></script></head><body><a class="skip-link" href="#main">Skip to content</a>`;
}
function breadcrumbs(items){
  return {'@type':'BreadcrumbList',itemListElement:items.map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item:`${base}${item}`}))};
}
function mobile(service){return `<div class="mobile-actions" aria-label="Quick contact"><a href="tel:+61430218539">Call Jia Tour</a><a href="${escape(quote(service))}">Request a quote ${arrow}</a></div>`;}
function cards(list){return `<div class="service-directory">${list.map((s)=>`<a href="${url(s)}"><span class="directory-title">${escape(s.name)} ${arrow}</span><p>${escape(s.intro)}</p><span class="directory-action">Explore this service</span></a>`).join('\n')}</div>`;}

for(const s of services){
  const canonical = base + url(s);
  const service = {'@type':'Service','@id':`${canonical}#service`,name:s.heading,serviceType:s.name,description:s.intro,url:canonical,provider:{'@id':organization['@id']},areaServed:organization.areaServed};
  const graph = [organization,website,service,{'@type':'WebPage','@id':canonical,url:canonical,name:s.title,description:s.description,inLanguage:'en-AU',isPartOf:{'@id':website['@id']},mainEntity:{'@id':service['@id']}},breadcrumbs([['Home','/'],['Our services','/services/'],[s.name,url(s)]])];
  const page = head(s.title,s.description,canonical,graph)+header.replace(/href="\/#quote"/g,`href="${escape(quote(s))}"`)+`
<main id="main">
<section class="service-hero"><div class="container">
<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services/">Our services</a><span aria-hidden="true">/</span><span aria-current="page">${escape(s.name)}</span></nav>
<div class="service-hero-layout"><div><p class="eyebrow">MELBOURNE BUS &amp; COACH CHARTER</p><h1>${escape(s.heading)}</h1><p class="service-lead">${escape(s.intro)}</p><div class="button-row"><a class="button button-gold" href="${escape(quote(s))}">Request a quote ${arrow}</a><a class="service-call" href="tel:+61430218539">0430 218 539</a></div></div>
<div class="service-fleet-card"><p class="eyebrow">ROOM FOR YOUR GROUP</p><img src="/assets/${s.image}" width="640" height="400" alt="${escape(s.imageAlt)}" fetchpriority="high"><p class="service-capacity">7–57 seat options</p><p>Passenger numbers, luggage and your itinerary help us find the right fit.</p><a href="/#fleet">Explore our fleet ${arrow}</a></div></div>
</div></section>
<section class="service-planning section"><div class="container service-planning-layout"><div class="service-copy">
${s.sections.map(section=>`<section><h2>${escape(section.heading)}</h2><p>${escape(section.text)}</p></section>`).join('\n')}
</div><aside class="journey-checklist" aria-labelledby="checklist-title"><p class="eyebrow">YOUR JOURNEY, YOUR DETAILS</p><h2 id="checklist-title">A useful starting point</h2><p>Include these details when you request your quote.</p><ul>${s.checklist.map(item=>`<li>${escape(item)}</li>`).join('')}</ul><a class="button button-dark" href="${escape(quote(s))}">Tell us your plans ${arrow}</a><p class="checklist-note">An enquiry does not confirm a booking. Your vehicle, price and arrangements are confirmed directly with Jia Tour.</p></aside></div></section>
<section class="service-questions section"><div class="container faq-section"><div><p class="eyebrow">BEFORE YOU GO</p><h2>Good to know</h2><p class="questions-intro">A few details to help you plan.</p></div><div class="faq-list">${s.faqs.map(faq=>`<details><summary>${escape(faq.q)}</summary><p>${escape(faq.a)}</p></details>`).join('\n')}</div></div></section>
<section class="service-related section"><div class="container"><div class="section-heading"><div><p class="eyebrow">MORE WAYS TO TRAVEL</p><h2>Explore your options</h2></div><a class="text-link" href="/services/">View all services ${arrow}</a></div>${cards(s.related.map(slug=>services.find(item=>item.slug===slug)))}</div></section>
<section class="service-enquiry"><div class="container"><div><p class="eyebrow">LET’S GET YOU THERE</p><h2>Ready to plan your journey?</h2><p>Speak with Jia Tour in Melbourne about your group and itinerary.</p></div><a class="button button-gold" href="${escape(quote(s))}">Request a quote ${arrow}</a></div></section>
</main>${footer.replace(/href="\/#quote"/g,`href="${escape(quote(s))}"`)}${mobile(s)}</body></html>\n`;
  const dir=path.join(root,'services',s.slug);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),page);
}

const directoryTitle='Bus & Coach Charter Services Melbourne | Jia Tour';
const directoryDescription='Explore Jia Tour charter services for schools, events, airports, weddings, snow trips, interstate journeys, day trips and travel agencies. Melbourne based.';
const directoryGraph=[organization,website,{'@type':'CollectionPage','@id':`${base}/services/`,url:`${base}/services/`,name:directoryTitle,description:directoryDescription,inLanguage:'en-AU',isPartOf:{'@id':website['@id']},mainEntity:{'@type':'ItemList',itemListElement:services.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:base+url(s)}))}},breadcrumbs([['Home','/'],['Our services','/services/']])];
await writeFile(path.join(root,'services','index.html'),head(directoryTitle,directoryDescription,`${base}/services/`,directoryGraph)+header+`<main id="main"><section class="directory-hero"><div class="container"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Our services</span></nav><p class="eyebrow">HOW WE CAN HELP</p><h1>Bus and coach charter<br>for your next journey</h1><p class="service-lead">Melbourne based, with journeys across Victoria and interstate. Explore the options for your group, then tell us where you would like to go.</p></div></section><section class="service-related section"><div class="container">${cards(services)}</div></section><section class="service-enquiry"><div class="container"><div><h2>Not sure where to start?</h2><p>Send your dates, group size and destination. We’ll discuss the next steps.</p></div><a class="button button-gold" href="/#quote">Request a quote ${arrow}</a></div></section></main>`+footer+`<div class="mobile-actions" aria-label="Quick contact"><a href="tel:+61430218539">Call Jia Tour</a><a href="/#quote">Request a quote ${arrow}</a></div></body></html>\n`);

// Homepage service rows become genuine crawlable links, retaining their order and presentation.
for(const s of services){
  const escapedJourney=escape(s.journey);
  home=home.replace(new RegExp(`<a class="service-item" href="[^"]*" data-service="${escapedJourney.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"`),`<a class="service-item" href="${url(s)}" data-service="${escapedJourney}"`);
  // Earlier markup used raw ampersands in data attributes.
  home=home.replace(`<a class="service-item" href="#quote" data-service="${s.journey}"`,`<a class="service-item" href="${url(s)}" data-service="${escapedJourney}"`);
}
const homeGraph=[organization,website,{'@type':'WebPage','@id':`${base}/#webpage`,url:`${base}/`,name:'Melbourne Bus Hire & Coach Charter | Jia Tour',inLanguage:'en-AU',isPartOf:{'@id':website['@id']},about:{'@id':organization['@id']}},{'@type':'ItemList',name:'Jia Tour charter services',itemListElement:services.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,url:base+url(s)}))}];
home=home.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':homeGraph})}</script>`);
if(!home.includes('max-image-preview'))home=home.replace('<meta name="referrer"','<meta name="robots" content="index, follow, max-image-preview:large">\n<meta name="referrer"');
home=home.replace('Melbourne bus and coach charter for schools, corporate events, airport transfers and private groups. Explore 7–57 seat vehicles and request a Jia Tour quote.','Melbourne bus hire and coach charter for schools, airports, events, snow trips and interstate journeys. Explore 7–57 seat options and request a Jia Tour quote.');
home=home.replace(/assets\/site.js\?v=[^" ]+/,'assets/site.js?v='+release);
// Footer directory link, while preserving the approved top navigation anchors.
home=home.replace('<div class="footer-links"><a href="#services">Our services</a>','<div class="footer-links"><a href="/services/">Our services</a>');
await writeFile(path.join(root,'index.html'),home);

const urls=['/','/services/',...services.map(url)];
await writeFile(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(p=>`  <url><loc>${base}${p}</loc><lastmod>${reviewed}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log(`Generated ${services.length} service pages, service directory, homepage metadata and sitemap (${urls.length} URLs).`);
