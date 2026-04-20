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
  }
});

// On shop page: read ?q= param and populate search
document.addEventListener('DOMContentLoaded', function() {
  updateCartBadge();

  // Mark out-of-stock size buttons
  document.querySelectorAll('.pdp-variant-btn').forEach(btn => {
    const size = btn.textContent.trim();
    if ((STOCK[size] ?? 0) === 0) {
      btn.classList.add('pdp-variant-btn--oos');
      btn.disabled = true;
    }
  });
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

// --- Cart State ---
let cartItems = JSON.parse(localStorage.getItem('shinsei-cart') || '[]');

function saveCart() {
  localStorage.setItem('shinsei-cart', JSON.stringify(cartItems));
}

function updateCartBadge() {
  const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count > 0 ? count : '';
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

function renderCart() {
  const body = document.getElementById('cart-body');
  if (!body) return;

  if (cartItems.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <p>YOUR CART IS EMPTY</p>
        <a href="shop.html" class="btn cart-browse-btn">BROWSE LINES</a>
      </div>`;
    return;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  body.innerHTML = `
    <div class="cart-items">
      ${cartItems.map((item, i) => `
        <div class="cart-item">
          <div class="cart-item-thumb">${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}</div>
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-meta">${item.size ? 'Size: ' + item.size + ' — ' : ''}$${item.price.toFixed(2)}</span>
          </div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn" onclick="changeQty(${i}, -1)">−</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button class="cart-qty-btn" onclick="changeQty(${i}, 1)">+</button>
          </div>
          <button class="cart-remove" onclick="removeFromCart(${i})" aria-label="Remove">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" stroke-width="1.5"/><line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" stroke-width="1.5"/></svg>
          </button>
        </div>`).join('')}
    </div>
    <div class="cart-footer">
      <div class="cart-subtotal">
        <span class="cart-subtotal-label">SUBTOTAL</span>
        <span class="cart-subtotal-value">$${subtotal.toFixed(2)}</span>
      </div>
      <button class="cart-checkout-btn" disabled>CHECKOUT — COMING SOON</button>
    </div>`;
}

function removeFromCart(index) {
  cartItems.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCart();
}

function changeQty(index, delta) {
  cartItems[index].qty += delta;
  if (cartItems[index].qty <= 0) cartItems.splice(index, 1);
  saveCart();
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

// --- Variant selection ---
function selectVariant(btn, group) {
  const parent = btn.closest('.pdp-variant-options');
  if (!parent) return;
  parent.querySelectorAll('.pdp-variant-btn').forEach(b => b.classList.remove('pdp-variant-btn--active'));
  btn.classList.add('pdp-variant-btn--active');
}

// --- Store tile image when navigating to product page ---
document.addEventListener('click', function(e) {
  const card = e.target.closest('[data-product-image]');
  if (card) sessionStorage.setItem('pdp-tile-image', card.dataset.productImage);
});

// --- Stock per size (simulate inventory) ---
const STOCK = { XS: 3, S: 8, M: 12, L: 7, XL: 4 };

// --- Simulated add to cart ---
function addToCart() {
  const title = document.querySelector('.pdp-title')?.textContent?.trim() || 'Product';
  const priceText = document.querySelector('.pdp-price')?.textContent?.trim() || '$0.00';
  const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
  const activeSize = document.querySelector('.pdp-variant-btn--active')?.textContent?.trim() || '';
  const urlImg = new URLSearchParams(window.location.search).get('img');
  const image = urlImg || sessionStorage.getItem('pdp-tile-image') || document.querySelector('.pdp-stack-img img, .pdp-gallery img')?.src || '';

  // Mandatory size check
  if (!activeSize) {
    const sizeGroup = document.querySelector('.pdp-variant-group');
    if (sizeGroup) {
      sizeGroup.classList.add('pdp-variant-error');
      setTimeout(() => sizeGroup.classList.remove('pdp-variant-error'), 2000);
    }
    return;
  }

  // Stock check
  const inCart = cartItems.filter(i => i.name === title && i.size === activeSize).reduce((s, i) => s + i.qty, 0);
  const stock = STOCK[activeSize] ?? 0;
  if (inCart >= stock) {
    const btn = event?.target || document.querySelector('.pdp-add-to-cart');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = stock === 0 ? 'OUT OF STOCK' : 'MAX QTY REACHED';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1800);
    }
    return;
  }

  const existing = cartItems.find(item => item.name === title && item.size === activeSize);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ name: title, price, size: activeSize, qty: 1, image });
  }
  saveCart();
  updateCartBadge();

  const btn = event?.target || document.querySelector('.pdp-add-to-cart');
  if (btn) {
    const original = btn.textContent;
    btn.textContent = 'Added';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      renderCart();
      toggleCart();
    }, 600);
  } else {
    renderCart();
    toggleCart();
  }
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
