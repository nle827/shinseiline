# Shinsei Line · Custom Shopify Theme

The storefront for Shinsei Line, an apparel brand I run. I designed the site and wrote the theme myself.

## How I built it

I worked in two stages so the design was locked before any Shopify code was written.

1. **Static preview** (`shinsei-preview/`). Plain HTML, CSS, and JavaScript versions of every page (home, shop, product, about, contact, policy). This is where the design, layout, and interactions were worked out.
2. **Shopify theme** (`shinsei-theme/`). The approved preview converted into a Liquid theme, built on Shopify's Skeleton theme as a starting point. Custom sections, templates, and assets carry over the preview's design.

## What's custom

- **Drop-window gating for limited releases.** Product pages move through phases (preview, passcode early access, public, departed) based on dates set in the theme settings, plus the product's real availability. Early access uses a passcode that's checked against a SHA-256 hash in the browser, so the plain passcode is never stored in the theme.
- **Password page with a notify-me signup**, including a confirmation state after someone signs up.
- **Product page** with variant selection, a size chart with a unit toggle, and accordions.
- **AJAX cart drawer** and shared interactions in `shinsei-global.js`.
- **Home page motion.** A draggable hero carousel and animated transit-map graphics in `shinsei-home.js`.
- **Email template** (`emails/`). A table-based HTML email with inline CSS so it renders in mail clients.

CSS and JS are split by purpose (`shinsei-global`, `shinsei-home`, `shinsei-pdp`, `shinsei-shop`). The product and shop files only load on those pages.

## Structure

```
shinsei-preview/   Static HTML/CSS/JS design preview
shinsei-theme/     Shopify Liquid theme (sections, templates, snippets, assets, config)
emails/            Marketing email template
```

## Running the theme locally

With the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) installed:

```bash
cd shinsei-theme
shopify theme dev --store <your-store>.myshopify.com
```

The preview needs no build step. Open `shinsei-preview/index.html` in a browser.
