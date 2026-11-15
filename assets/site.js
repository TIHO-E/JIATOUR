'use strict';
document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const header = document.querySelector('.site-header');
function closeMenu() {
  if (!menu || !nav) return;
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('is-open');
}
if (menu && nav) {
  menu.addEventListener('click', () => {
    const opening = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(opening));
    menu.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', opening);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (header && !header.contains(event.target)) closeMenu();
  });
  window.matchMedia('(max-width: 800px)').addEventListener('change', closeMenu);
}
if (header) {
  const measureHeader = () => document.documentElement.style.setProperty('--header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
}
document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
// Keep campaign labels on internal journeys without cookies or browser storage.
// Only these four labels are forwarded; arbitrary query parameters are not copied.
const arrivalParams = new URLSearchParams(window.location.search);
const campaignLabels = new URLSearchParams();
for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
  const value = (arrivalParams.get(key) || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80);
  if (value) campaignLabels.set(key, value);
}
if (campaignLabels.size) {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // In-page anchors already retain the current URL's query string.
    if (!href || href.startsWith('#') || link.hasAttribute('download')) return;
    let target;
    try { target = new URL(href, window.location.href); } catch { return; }
    if (target.origin !== window.location.origin || !['http:', 'https:'].includes(target.protocol)) return;
    for (const [key, value] of campaignLabels) {
      if (!target.searchParams.has(key)) target.searchParams.set(key, value);
    }
    link.href = target.pathname + target.search + target.hash;
  });
}
const form = document.querySelector('#quote-form');
if (form) {
  const serviceSelect = form.querySelector('#service');
  const requestedTrip = arrivalParams.get('trip');
  if (serviceSelect && !serviceSelect.value && requestedTrip && Array.from(serviceSelect.options).some(option => option.value === requestedTrip)) {
    serviceSelect.value = requestedTrip;
  }
  document.querySelectorAll('[data-vehicle]').forEach(link => link.addEventListener('click', () => {
    form.querySelector('#vehicle').value = link.dataset.vehicle;
  }));
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    form.querySelector('#service').value = link.dataset.service;
  }));

}
const share = document.querySelector('#share-site');
if (share) {
  share.addEventListener('click', async () => {
    const status = document.querySelector('#share-status');
    const url = 'https://www.jiatour.com.au/?utm_source=share&utm_medium=referral&utm_campaign=website';
    status.textContent = '';
    try {
      if (navigator.share) {
        await navigator.share({title: 'Jia Tour | Melbourne Bus & Coach Charter', text: 'Bus and coach charter for your next group journey.', url});
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url); status.textContent = 'Website link copied.';
      } else { status.textContent = 'Share this website: https://www.jiatour.com.au/'; }
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = 'Share this website: https://www.jiatour.com.au/';
    }
  });
}
