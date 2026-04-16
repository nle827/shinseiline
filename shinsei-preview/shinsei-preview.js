/* ============================================================
   SHINSEI LINE — Local Preview JS
   Simulates Shopify interactions for local HTML preview.
   ============================================================ */

// --- Cart Drawer ---
function toggleCart() {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;
  drawer.classList.toggle('open');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
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
  const parent = btn.closest('.variant-options');
  if (!parent) return;
  parent.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// --- Simulated add to cart ---
function addToCart() {
  const btn = event?.target || document.querySelector('#add-to-cart');
  if (!btn) return;
  const original = btn.textContent;
  btn.textContent = 'Adding...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Added';
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      toggleCart();
    }, 800);
  }, 500);
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
