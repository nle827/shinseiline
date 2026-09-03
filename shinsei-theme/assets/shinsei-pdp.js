/* ============================================================
   SHINSEI LINE — PDP JS
   Variant selection, quantity stepper (capped to real per-variant
   inventory), and add-to-cart. Loaded only on product pages.
   Depends on shinsei-global.js (toggleCart, updateCartBadge,
   renderCart), which is loaded first on every page.
   ============================================================ */

// Real stock ceiling for whichever size is currently selected. Only Shopify
// variants that both track inventory ("shopify") and deny overselling have a
// hard cap — anything else (untracked, or "continue selling") is treated as
// unlimited from the UI's perspective, matching what Shopify itself allows.
function getSelectedVariantCap() {
  const activeBtn = document.querySelector('.pdp-variant-btn--active');
  if (!activeBtn) return 99;
  const management = activeBtn.dataset.inventoryManagement;
  const policy = activeBtn.dataset.inventoryPolicy;
  const qty = parseInt(activeBtn.dataset.inventory, 10);
  if (management === 'shopify' && policy === 'deny' && !isNaN(qty)) {
    return Math.max(0, qty);
  }
  return 99;
}

function changeQuantity(delta) {
  const input = document.getElementById('pdp-quantity-input');
  if (!input) return;
  const cap = getSelectedVariantCap();
  let val = parseInt(input.value, 10);
  if (isNaN(val)) val = 1;
  val = Math.max(1, Math.min(cap, val + delta));
  input.value = val;
}

function clampQuantityInput() {
  const input = document.getElementById('pdp-quantity-input');
  if (!input) return;
  const cap = getSelectedVariantCap();
  let val = parseInt(input.value, 10);
  if (isNaN(val) || val < 1) val = 1;
  if (val > cap) val = cap;
  input.value = val;
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
  const qtyInput = document.getElementById('pdp-quantity-input');
  // Final, authoritative clamp right before the request is built — the
  // stepper and manual typing are both re-checked here so nothing can slip
  // past the UI's own cap on its way to the network request.
  const cap = getSelectedVariantCap();
  const quantity = qtyInput ? Math.max(1, Math.min(cap, parseInt(qtyInput.value, 10) || 1)) : 1;

  const res = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity: quantity })
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
  if (qtyInput) qtyInput.value = 1;

  updateCartBadge();
  await renderCart();
  toggleCart();
}

// --- Variant selection ---
function selectVariant(btn, group) {
  const parent = btn.closest('.pdp-variant-options');
  if (!parent) return;
  parent.querySelectorAll('.pdp-variant-btn').forEach(b => b.classList.remove('pdp-variant-btn--active'));
  btn.classList.add('pdp-variant-btn--active');

  // Different sizes can carry different stock levels — re-clamp the
  // quantity stepper to whichever size is now selected so a quantity typed
  // in for a well-stocked size can't carry over to one with less left.
  const input = document.getElementById('pdp-quantity-input');
  if (input) {
    const cap = getSelectedVariantCap();
    input.max = cap;
    const current = parseInt(input.value, 10);
    if (!isNaN(current) && current > cap) input.value = Math.max(1, cap);
  }
}
