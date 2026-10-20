// Read-only screenshots of a theme through its preview link (no CLI, no uploads).
//
// usage:
//   cd scripts && npm install && npx playwright install chromium
//   SF_PW=<storefront password> node screenshots.js <out-dir> [theme-id]
//
// Captures home, product, gallery, open size chart and password pages at
// 390px and 1440px. Defaults to the "Shinsei Line – Modular" duplicate theme.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'https://menacity-clothing.myshopify.com';
const THEME = process.argv[3] || '131725852805';
const PW = process.env.SF_PW;
const OUT = process.argv[2];
const PRODUCT = 'kagemi';

if (!OUT || !PW) {
  console.error('usage: SF_PW=<storefront password> node screenshots.js <out-dir> [theme-id]');
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

// pb=0 hides Shopify's preview bar
const url = (p) => `${BASE}${p}${p.includes('?') ? '&' : '?'}preview_theme_id=${THEME}&pb=0`;

(async () => {
  const browser = await chromium.launch();
  for (const [label, width, height] of [['390', 390, 844], ['1440', 1440, 900]]) {
    const mobile = width < 500;
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();

    const shot = async (name, fullPage = true) => {
      await page.waitForTimeout(1500);
      // Dismiss Shopify's cookie banner so it doesn't cover the page
      const decline = page.getByRole('button', { name: 'Decline' });
      if (await decline.isVisible().catch(() => false)) {
        await decline.click();
        await page.waitForTimeout(500);
      }
      await page.addStyleTag({ content: '#preview-bar-iframe, #PBarNextFrameWrapper { display: none !important; }' }).catch(() => {});
      await page.screenshot({ path: path.join(OUT, `${name}-${label}.png`), fullPage });
      console.log('saved', name, label);
    };

    await page.goto(url('/password'), { waitUntil: 'networkidle' });
    await shot('password-page', false);

    // The theme hides Shopify's password form, so submit it directly.
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.evaluate((pw) => {
        const input = document.querySelector('input[type="password"]');
        input.value = pw;
        input.form.submit();
      }, PW),
    ]);

    await page.goto(url('/'), { waitUntil: 'networkidle' });
    await shot('home-page');

    await page.goto(url(`/products/${PRODUCT}`), { waitUntil: 'networkidle' });
    await shot('product-page');
    await shot('gallery', false);

    const trigger = page.locator('.accordion-trigger', { hasText: 'Sizing' });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page.locator('.size-chart-wrap').scrollIntoViewIfNeeded();
    await shot('size-chart-open', false);

    await ctx.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
