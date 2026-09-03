/* ============================================================
   SHINSEI LINE — Global JS
   Site-wide chrome: search overlay, mobile nav, header scroll
   state, accordions, Notify Me / Request Access modals, and the
   Shopify AJAX cart drawer. Loaded on every page.
   ============================================================ */

// --- Search Overlay ---
function toggleSearch() {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  const opening = !overlay.classList.contains('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = opening ? 'hidden' : '';
  if (opening) {
    setTimeout(() => {
      const input = document.getElementById('search-overlay-input');
      if (input) input.focus();
    }, 50);
  }
}

function submitSearch(e) {
  e.preventDefault();
  const query = document.getElementById('search-overlay-input').value.trim();
  if (!query) return;
  window.location.href = 'shop.html?q=' + encodeURIComponent(query);
}

// Close overlay on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('search-overlay');
    if (overlay && overlay.classList.contains('open')) toggleSearch();
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav && mobileNav.classList.contains('open')) toggleMobileNav();
  }
});

// --- Mobile Nav ---
function toggleMobileNav() {
  const overlay = document.getElementById('mobile-nav');
  const btn = document.querySelector('.hamburger-btn');
  if (!overlay) return;
  const isOpen = overlay.classList.toggle('open');
  overlay.setAttribute('aria-hidden', !isOpen);
  if (btn) {
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', isOpen);
  }
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// On shop page: read ?q= param and populate search
document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();

  // Shopify appends `#<form id>` to the redirect URL for named forms (to
  // scroll back to them). We don't want that fragment lingering in the
  // address bar, so strip it immediately for our known form IDs.
  if (window.location.hash === '#NotifyMeForm' || window.location.hash === '#RequestAccessForm' || window.location.hash === '#PasswordSignupForm') {
    window.history.replaceState({}, '', window.location.pathname + window.location.search);
  }

  const input = document.getElementById('shop-search-input');
  if (input) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      input.value = q;
      if (typeof filterProducts === 'function') filterProducts();
    }
  }

  const params = new URLSearchParams(window.location.search);

  // Move the Notify Me / Request Access overlays to be direct children of
  // <body> so their `position: fixed` is always anchored to the real
  // viewport, regardless of any ancestor (animations, transforms, etc.)
  // that could otherwise turn it into a fixed-position containing block.
  [notifyModal, requestModal].forEach(function (modal) {
    const overlay = document.getElementById(modal.ids.overlay);
    if (overlay && overlay.parentElement !== document.body) {
      document.body.appendChild(overlay);
    }
    // If the page loaded already showing a result (no-JS fallback after a
    // real form POST), lock scroll and auto-dismiss a success state.
    const successEl = document.getElementById(modal.ids.success);
    if (overlay && overlay.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
      if (successEl && successEl.style.display !== 'none') {
        setTimeout(modal.close, 3000);
      }
    }
    const formEl = document.getElementById(modal.ids.formId);
    if (formEl) formEl.addEventListener('submit', modal.handleSubmit);
  });

  // Confirmation after a real page reload (e.g. a captcha challenge that
  // takes over the submission instead of our AJAX flow): Shopify's own
  // "this just succeeded" flash state doesn't reliably survive that extra
  // hop, so we don't depend on it. Instead the return_to URL carries a
  // marker we control, checked here independent of any server-rendered
  // state — this is what actually shows the confirmation in that case.
  let urlMarkerFound = false;
  if (params.get('notified') === '1') {
    notifyModal.open();
    notifyModal.showSuccess();
    params.delete('notified');
    urlMarkerFound = true;
  }
  if (params.get('requested') === '1') {
    requestModal.open();
    requestModal.showSuccess();
    params.delete('requested');
    urlMarkerFound = true;
  }
  if (urlMarkerFound) {
    const qs = params.toString();
    const cleanUrl = window.location.pathname + (qs ? '?' + qs : '');
    window.history.replaceState({}, '', cleanUrl);
  }
});

// --- Notify Me / Request Access modals ---
// Both flows are functionally and visually identical (same CSS classes,
// same behavior) — only the element IDs, form, and copy differ — so they
// share one controller implementation instead of duplicating it.
function createModalController(ids) {
  let settled = false;
  let submitting = false;
  let errorTimer = null;

  function open() {
    const overlay = document.getElementById(ids.overlay);
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    settled = false;
  }

  function close() {
    const overlay = document.getElementById(ids.overlay);
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    clearTimeout(errorTimer);
    setTimeout(() => {
      const formWrap = document.getElementById(ids.content);
      const successWrap = document.getElementById(ids.success);
      const formEl = document.getElementById(ids.formId);
      const loadingEl = document.getElementById(ids.loading);
      if (formWrap) {
        const errorEl = formWrap.querySelector('.notify-modal-error');
        if (errorEl) errorEl.remove();
        formWrap.style.display = '';
      }
      if (successWrap) successWrap.style.display = 'none';
      if (formEl) formEl.style.display = '';
      if (loadingEl) loadingEl.style.display = 'none';
      settled = false;
    }, 300);
  }

  function showLoading() {
    const formEl = document.getElementById(ids.formId);
    const loadingEl = document.getElementById(ids.loading);
    if (formEl) formEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'flex';
  }

  function hideLoading() {
    const formEl = document.getElementById(ids.formId);
    const loadingEl = document.getElementById(ids.loading);
    if (loadingEl) loadingEl.style.display = 'none';
    if (formEl) formEl.style.display = '';
  }

  function showSuccess() {
    settled = true;
    clearTimeout(errorTimer);
    hideLoading();
    const formWrap = document.getElementById(ids.content);
    const successWrap = document.getElementById(ids.success);
    if (formWrap) {
      const errorEl = formWrap.querySelector('.notify-modal-error');
      if (errorEl) errorEl.remove();
      formWrap.style.display = 'none';
    }
    if (successWrap) successWrap.style.display = '';
    setTimeout(close, 3000);
  }

  function showError(message) {
    // Delay and bail if a success lands in the meantime, so a premature
    // response (e.g. a first submit attempt that fires before an invisible
    // captcha check finishes, ~1-2s) can't flash an error before the real
    // result arrives. The loading indicator stays visible for this whole
    // window so the page never looks like it stalled.
    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
      if (settled) return;
      hideLoading();
      const formWrap = document.getElementById(ids.content);
      if (!formWrap) return;
      let errorEl = formWrap.querySelector('.notify-modal-error');
      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.className = 'notify-modal-error';
        formWrap.appendChild(errorEl);
      }
      errorEl.textContent = message;
    }, 3000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    showLoading();

    const form = e.target;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        credentials: 'same-origin'
      });
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const statusEl = doc.getElementById(ids.statusDataId);
      const status = statusEl ? JSON.parse(statusEl.textContent) : { success: false, error: true };

      if (status.success) {
        showSuccess();
      } else {
        const newErrorEl = doc.querySelector('#' + ids.content + ' .notify-modal-error');
        showError(newErrorEl ? newErrorEl.textContent.trim() : 'Something went wrong. Please try again.');
      }
    } catch (err) {
      showError('Something went wrong. Please try again.');
    } finally {
      submitting = false;
    }
  }

  return { ids, open, close, handleSubmit, showSuccess };
}

const notifyModal = createModalController({
  overlay: 'notify-modal-overlay',
  content: 'notify-modal-content',
  success: 'notify-modal-success',
  loading: 'notify-loading',
  formId: 'NotifyMeForm',
  statusDataId: 'notify-status-data'
});

const requestModal = createModalController({
  overlay: 'request-modal-overlay',
  content: 'request-modal-content',
  success: 'request-modal-success',
  loading: 'request-loading',
  formId: 'RequestAccessForm',
  statusDataId: 'request-status-data'
});

function openNotifyModal() { notifyModal.open(); }
function closeNotifyModal() { notifyModal.close(); }
function openRequestModal() { requestModal.open(); }
function closeRequestModal() { requestModal.close(); }

// --- Shopify AJAX Cart ---

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
}

// Cart line items are built with innerHTML below, so anything that came
// from product/variant data (merchant-editable, not sanitized by Shopify's
// cart API) must be escaped before it's interpolated — otherwise a title
// containing markup would execute in every visitor's cart drawer.
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

async function fetchCart() {
  const res = await fetch('/cart.js');
  return res.json();
}

function updateCartBadge() {
  fetchCart().then(cart => {
    const count = cart.item_count;
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count > 0 ? count : '';
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  });
}

async function renderCart() {
  const body = document.getElementById('cart-body');
  if (!body) return;

  const cart = await fetchCart();

  if (cart.item_count === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <p>YOUR CART IS EMPTY</p>
        <a href="/collections/all" class="btn cart-browse-btn">BROWSE LINES</a>
      </div>`;
    return;
  }

  body.innerHTML = `
    <div class="cart-items">
      ${cart.items.map(item => `
        <div class="cart-item">
          <div class="cart-item-thumb">${item.featured_image ? `<img src="${escapeHtml(item.featured_image.url)}" alt="${escapeHtml(item.product_title)}">` : ''}</div>
          <div class="cart-item-info">
            <span class="cart-item-name">${escapeHtml(item.product_title)}</span>
            <span class="cart-item-meta">${item.variant_title && item.variant_title !== 'Default Title' ? 'Size: ' + escapeHtml(item.variant_title) + ' — ' : ''}${formatMoney(item.price)}</span>
          </div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn" onclick="changeQty('${item.key}', ${item.quantity - 1})">−</button>
            <span class="cart-qty-value">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="changeQty('${item.key}', ${item.quantity + 1})">+</button>
          </div>
          <button class="cart-remove" onclick="removeFromCart('${item.key}')" aria-label="Remove">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.5"/><line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
        </div>`).join('')}
    </div>
    <div class="cart-footer">
      <div class="cart-subtotal">
        <span class="cart-subtotal-label">SUBTOTAL</span>
        <span class="cart-subtotal-value">${formatMoney(cart.total_price)}</span>
      </div>
      <a href="/checkout" class="cart-checkout-btn">CHECKOUT</a>
    </div>`;
}

async function removeFromCart(key) {
  await fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: 0 })
  });
  updateCartBadge();
  renderCart();
}

async function changeQty(key, newQty) {
  if (newQty <= 0) { removeFromCart(key); return; }
  await fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: newQty })
  });
  updateCartBadge();
  renderCart();
}

// --- Cart Drawer ---
function toggleCart() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  drawer.classList.toggle('open');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  if (drawer.classList.contains('open')) renderCart();
}

// --- Accordions ---
function toggleAccordion(trigger) {
  const isOpen = trigger.classList.contains('open');
  const body = trigger.nextElementSibling;

  // Close all
  document.querySelectorAll('.accordion-trigger.open').forEach(t => {
    t.classList.remove('open');
    t.nextElementSibling.classList.remove('open');
  });

  // Open clicked if it wasn't already open
  if (!isOpen) {
    trigger.classList.add('open');
    body.classList.add('open');
  }
}

// --- Header scroll transparency ---
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const hasHero = !!document.querySelector('.hero');
  const onScroll = () => {
    const shouldScroll = !hasHero || window.scrollY > 50;
    header.classList.toggle('scrolled', shouldScroll);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// --- Escape key closes cart ---
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const drawer = document.getElementById('cart-drawer');
    if (drawer?.classList.contains('open')) toggleCart();
  }
});
