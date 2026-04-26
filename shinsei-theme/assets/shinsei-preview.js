/* ============================================================
   SHINSEI LINE — Local Preview JS
   Simulates Shopify interactions for local HTML preview.
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

  const input = document.getElementById('shop-search-input');
  if (input) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      input.value = q;
      if (typeof filterProducts === 'function') filterProducts();
    }
  }

  // PDP: switch to unavailable mode if ?available=false or soldout
  const params = new URLSearchParams(window.location.search);
  const availState = params.get('available');
  if (availState === 'false') {
    const avail = document.getElementById('pdp-actions-available');
    const unavail = document.getElementById('pdp-actions-unavailable');
    const variants = document.querySelector('.pdp-variants');
    if (avail) avail.style.display = 'none';
    if (unavail) unavail.style.display = '';
    if (variants) variants.style.display = 'none';
  } else if (availState === 'soldout') {
    const avail = document.getElementById('pdp-actions-available');
    const soldout = document.getElementById('pdp-actions-soldout');
    if (avail) avail.style.display = 'none';
    if (soldout) soldout.style.display = '';
  }
});

// --- Shopify AJAX Cart ---

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2);
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
          <div class="cart-item-thumb">${item.featured_image ? `<img src="${item.featured_image.url}" alt="${item.product_title}">` : ''}</div>
          <div class="cart-item-info">
            <span class="cart-item-name">${item.product_title}</span>
            <span class="cart-item-meta">${item.variant_title && item.variant_title !== 'Default Title' ? 'Size: ' + item.variant_title + ' — ' : ''}${formatMoney(item.price)}</span>
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

async function addToCart() {
  const activeBtn = document.querySelector('.pdp-variant-btn--active');

  if (!activeBtn) {
    const sizeGroup = document.querySelector('.pdp-variant-group');
    if (sizeGroup) {
      sizeGroup.classList.add('pdp-variant-error');
      setTimeout(() => sizeGroup.classList.remove('pdp-variant-error'), 2000);
    }
    return;
  }

  const variantId = parseInt(activeBtn.dataset.variantId);
  const btn = document.querySelector('.pdp-add-to-cart');

  const res = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: 1 })
  });

  if (!res.ok) {
    const err = await res.json();
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = err.description || 'MAX QTY REACHED';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1800);
    }
    return;
  }

  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Added';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 600);
  }

  updateCartBadge();
  await renderCart();
  toggleCart();
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

// --- Variant selection ---
function selectVariant(btn, group) {
  const parent = btn.closest('.pdp-variant-options');
  if (!parent) return;
  parent.querySelectorAll('.pdp-variant-btn').forEach(b => b.classList.remove('pdp-variant-btn--active'));
  btn.classList.add('pdp-variant-btn--active');
}

// --- Contact form simulation ---
function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    form.innerHTML = '<div style="padding: 24px; border: 1px solid #E2E2E2; font-family: \'Courier New\', monospace; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: #666;">Message received. We\'ll be in touch.</div>';
  }, 800);
}

// --- Request Access ---
function submitRequestAccess(e) {
  e.preventDefault();
  const email = document.getElementById('access-email').value.trim();
  if (!email) { document.getElementById('access-email').focus(); return; }
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Submitting...';
  btn.disabled = true;
  setTimeout(() => {
    form.style.display = 'none';
    document.getElementById('pdp-access-confirmed').style.display = '';
  }, 600);
}

// --- Notify Me (soldout) ---
function submitNotifyMe(e) {
  e.preventDefault();
  const email = document.getElementById('notify-email').value.trim();
  if (!email) { document.getElementById('notify-email').focus(); return; }
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Submitting...';
  btn.disabled = true;
  setTimeout(() => {
    form.style.display = 'none';
    document.getElementById('pdp-notify-confirmed').style.display = '';
  }, 600);
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
