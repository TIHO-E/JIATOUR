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
const form = document.querySelector('#quote-form');
if (form) {
  document.querySelectorAll('[data-vehicle]').forEach(link => link.addEventListener('click', () => {
    form.querySelector('#vehicle').value = link.dataset.vehicle;
  }));
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    form.querySelector('#service').value = link.dataset.service;
  }));
  const params = new URLSearchParams(window.location.search);
  const campaignFields = {utm_source: 'campaign-source', utm_medium: 'campaign-medium', utm_campaign: 'campaign-name', utm_content: 'campaign-content'};
  Object.entries(campaignFields).forEach(([parameter, field]) => {
    const value = (params.get(parameter) || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 160);
    if (value) form.querySelector(`#${field}`).value = value;
  });
  const dateInput = form.querySelector('#date');
  function melbourneToday() {
    const parts = new Intl.DateTimeFormat('en-AU', {timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  dateInput.min = melbourneToday();
  dateInput.addEventListener('input', () => dateInput.setCustomValidity(''));
  const submit = form.querySelector('button[type="submit"]');
  const originalButton = submit.innerHTML;
  form.addEventListener('submit', event => {
    dateInput.min = melbourneToday();
    dateInput.setCustomValidity(dateInput.value && dateInput.value < dateInput.min ? 'Please choose today or a future travel date.' : '');
    if (!form.checkValidity()) {
      event.preventDefault(); form.reportValidity(); return;
    }
    // Leave delivery to the native POST and provider verification; never fake success.
    submit.disabled = true;
    submit.textContent = 'Continuing to verification…';
    document.querySelector('#form-status').textContent = 'Please complete the verification on the next page. If it does not open, call 0430 218 539.';
  });
  window.addEventListener('pageshow', () => {
    submit.disabled = false; submit.innerHTML = originalButton;
    document.querySelector('#form-status').textContent = 'You’ll continue to a secure verification step.';
  });
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
