'use strict';
(() => {
  const form = document.querySelector('#quote-form');
  if (!form) return;
  const endpoint = form.dataset.enquiryEndpoint;
  const sitekey = form.dataset.turnstileSitekey;
  const submit = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#form-status');
  const retry = document.querySelector('#retry-verification');
  const widget = document.querySelector('#enquiry-verification');
  const success = document.querySelector('#enquiry-success');
  const dateInput = form.querySelector('#date');
  const originalButton = submit.innerHTML;
  const fields = ['Name', 'email', 'Phone', 'Journey', 'Date', 'Passengers', 'Vehicle', 'Pickup', 'Destination', 'Notes', '_honey'];
  const campaign = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = (params.get(key) || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80);
    if (value) campaign[key] = value;
  }
  let token = '', widgetId = null, widgetSize = '', busy = false, completed = false;
  let requestId = '', fingerprint = '', loading = false, loadTimer = null;

  function updateButton() {
    submit.disabled = busy || completed || !token;
    if (busy) submit.textContent = 'Sending enquiry…';
    else submit.innerHTML = originalButton;
  }
  function message(text, error = false) {
    status.textContent = text;
    status.classList.toggle('is-error', error);
  }
  function today() {
    const parts = new Intl.DateTimeFormat('en-AU', {timeZone:'Australia/Melbourne', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
    const get = type => parts.find(part => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function verificationError() {
    token = '';
    if (!busy && !completed) {
      retry.hidden = false;
      message('The security check could not finish. Please retry below, or call 0430 218 539.', true);
    }
    updateButton();
    return true;
  }
  function renderWidget() {
    loading = false;
    window.clearTimeout(loadTimer);
    if (completed || widgetId !== null) return;
    if (!window.turnstile) { verificationError(); return; }
    retry.hidden = true;
    widgetSize = widget.clientWidth < 300 ? 'compact' : 'flexible';
    try {
      widgetId = window.turnstile.render(widget, {
        sitekey, action:'enquiry', theme:'light', size:widgetSize,
        'response-field':false,
        callback: value => {
          token = value;
          retry.hidden = true;
          if (!busy && !completed) message('Security check complete. Your enquiry is ready to send.');
          updateButton();
        },
        'error-callback': verificationError,
        'expired-callback': () => {
          token = '';
          if (!busy && !completed) {
            message('The security check has expired. Please complete it again before sending.');
            retry.hidden = false;
          }
          updateButton();
        },
        'timeout-callback': verificationError
      });
    } catch { verificationError(); }
  }
  function loadVerification() {
    if (completed || busy) return;
    token = '';
    retry.hidden = true;
    message('Loading security check…');
    updateButton();
    if (window.turnstile) {
      if (widgetId !== null) {
        try { window.turnstile.reset(widgetId); } catch { verificationError(); }
      } else renderWidget();
      return;
    }
    if (loading) return;
    loading = true;
    document.querySelector('#jia-turnstile-api')?.remove();
    const script = document.createElement('script');
    script.id = 'jia-turnstile-api';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=jiaTurnstileLoaded';
    script.async = true;
    script.onerror = () => { loading = false; window.clearTimeout(loadTimer); verificationError(); };
    loadTimer = window.setTimeout(() => { loading = false; verificationError(); }, 15000);
    document.head.append(script);
  }
  function resetAfterFailure(text) {
    token = '';
    retry.hidden = false;
    if (window.turnstile && widgetId !== null) {
      try { window.turnstile.reset(widgetId); } catch { /* Keep a visible retry and contact fallback. */ }
    }
    message(text, true);
    updateButton();
  }

  dateInput.min = today();
  dateInput.addEventListener('input', () => dateInput.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || completed) return;
    dateInput.min = today();
    dateInput.setCustomValidity(dateInput.value && dateInput.value < dateInput.min ? 'Please choose today or a future travel date.' : '');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!token) { message('Please complete the security check before sending.', true); retry.hidden = false; return; }
    const body = Object.fromEntries(fields.map(name => [name, String(form.elements.namedItem(name)?.value || '').trim()]));
    Object.assign(body, campaign);
    const nextFingerprint = JSON.stringify(body);
    if (!requestId || fingerprint !== nextFingerprint) {
      requestId = window.crypto.randomUUID();
      fingerprint = nextFingerprint;
    }
    Object.assign(body, {requestId, turnstileToken:token});
    const controls = [...form.querySelectorAll('fieldset')];
    busy = true;
    retry.hidden = true;
    form.setAttribute('aria-busy', 'true');
    controls.forEach(fieldset => { fieldset.disabled = true; });
    updateButton();
    message('Sending your enquiry. Please keep this page open…');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    let failure = '';
    try {
      const response = await fetch(endpoint, {method:'POST', mode:'cors', credentials:'omit', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), signal:controller.signal});
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok === true && result.requestId === requestId) {
        completed = true;
        token = '';
        form.classList.add('is-submitted');
        success.hidden = false;
        message('Your enquiry has been submitted.');
        success.focus();
      } else if (result?.code === 'verification_required') {
        failure = 'Please complete the security check again, then resend your enquiry.';
      } else if (response.status === 400) {
        failure = 'Please check your contact and trip details, complete the security check, and try again.';
      } else {
        failure = 'We could not confirm your submission. Please complete the security check and try again, or call 0430 218 539.';
      }
    } catch {
      failure = 'We could not confirm your submission. Your details are still here. Please retry, or call 0430 218 539.';
    } finally {
      window.clearTimeout(timeout);
      busy = false;
      form.setAttribute('aria-busy', 'false');
      if (!completed) controls.forEach(fieldset => { fieldset.disabled = false; });
      updateButton();
      if (failure) resetAfterFailure(failure);
    }
  });
  retry.addEventListener('click', loadVerification);
  window.addEventListener('pageshow', event => {
    if (event.persisted && !completed && !busy) loadVerification();
  });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      const size = widget.clientWidth < 300 ? 'compact' : 'flexible';
      if (!busy && !completed && widgetId !== null && widgetSize !== size) {
        window.turnstile.remove(widgetId);
        widgetId = null;
        token = '';
        updateButton();
        renderWidget();
      }
    }).observe(widget);
  }
  if (endpoint !== 'https://jiatour-enquiries.tiho-largaux.workers.dev/enquiry' || !sitekey || typeof window.crypto.randomUUID !== 'function') {
    message('Please email jiatour@hotmail.com or call 0430 218 539 to send your enquiry.', true);
    return;
  }
  window.jiaTurnstileLoaded = renderWidget;
  loadVerification();
})();
