# Step 2 audit: hardcoded content and custom features

Audited 2026-10-19 on branch `modular-refactor`, after the step 1 cleanup.

## Headline findings

1. **No custom section is editable in the theme editor.** `home`, `product`, `page-about`, `page-contact`, `page-policy`, `collection` and `404` all ship `"settings": []` with no blocks and no presets. Only `password` has settings (coat image, three text lines, button label).
2. **The header and footer don't use sections.** Nav, logo, cart trigger, mobile menu and footer links are hardcoded in `layout/theme.liquid`. Skeleton's `sections/header.liquid`, `sections/footer.liquid`, `header-group.json` and `footer-group.json` are never rendered: the layout has no `{% sections %}` tag. Step 1 missed them because the group JSON files counted as references.
3. **The theme settings don't reach the CSS.** `snippets/css-variables.liquid` (Skeleton's font, colour and width settings) is rendered only on the password layout, and no stylesheet reads its variables. The real tokens are two hand-written `:root` blocks in `shinsei-global.css` and `shinsei-home.css`, plus about 28 raw hex values. This is step 3.
4. **Bugs found along the way:**
   - The home LINE 01 card's fallback price is hardcoded as **$485.00**. The product is $595.00. It only shows if `all_products['kagemi']` fails, but it's wrong.
   - The PDP renders a complete "Notify me" modal that nothing can open (`openNotifyModal` was never called). It's dead markup unless you want it back.
   - The drop-phase JSON blob is duplicated in `home.liquid` and `product.liquid`.

## The four target features

### 1. Product specifications: `sections/product.liquid` lines 22–42

**Now:** a `{% capture construction_blocks %}` with four hardcoded label/paragraph pairs (Design, Material, Construction, Fit). It renders twice: once as the left column on desktop, and once inside the mobile "Product specifications" accordion. The copy already matches the brief.

**Convert to:**
- A theme block `blocks/nl-spec-list.liquid` that renders a list of spec rows. It's placed in the product section and has its own heading setting ("Product specifications").
- **Data:** a product metafield `nl.specs`, a list of references to an `nl_spec` metaobject (label + body). Any number of rows, in any order, editable per product in the admin.
- **Fallback:** nested `nl-spec-row` blocks (label + body settings) for themes or products with no metafield set.
- The desktop column and the mobile accordion render from the same block, so the copy lives in one place.

### 2. Size chart: `sections/product.liquid` lines 262–288, `assets/shinsei-pdp.js` `setSizeChartUnit()`

**Now:** a hardcoded 4×4 table. Each cell carries both `data-in` and `data-cm`, with a global `onclick` toggle and a hardcoded fit note.

**Convert to:**
- A theme block `blocks/nl-size-chart.liquid` plus a custom element `<nl-size-chart>` for the IN/CM toggle. The toggle uses `aria-pressed`, works from the keyboard, and remembers the choice in `localStorage`.
- **Data:** a metaobject `nl_size_chart` referenced from the product metafield `nl.size_chart`. One chart can be shared by many products.
- **Store centimetres only.** I checked all 16 current values: rounding cm ÷ 2.54 to the nearest half inch reproduces every inch value exactly, so a merchant enters one set of numbers.
- No sideways scroll: the table is fixed-layout at mobile widths, with the measurement label column wrapping.
- **Fallback:** if no metaobject is set, the block shows nothing in the storefront and a hint in the editor.

### 3. Swipe gallery with "01 / 04" counter: `sections/product.liquid` lines 52–83, `assets/shinsei-pdp.js` `trackGalleryPosition()`

**Now:** a loop over `product.images` (already data-driven), a mobile counter built in Liquid, and a scroll listener in the global PDP script that updates `#pdp-gallery-current`.

**Convert to:**
- A theme block `blocks/nl-gallery.liquid` plus a custom element `<nl-gallery>`.
- Uses `product.media` instead of `product.images`, so video and 3D media work too.
- **Settings:** show counter (on/off), counter format (`01 / 04` or `1 of 4`), and image widths.
- Live-region announcement of the slide position, plus arrow-key support.
- The CSS scroll-snap swipe continues to work without JS. JS only updates the counter.
- No metafield needed: the content is the product's own media.

### 4. Password page: `sections/password.liquid`

**Now:** partly editable. Hardcoded: the logo (`shinsei-logo.png`), the "LINE 01" tag, the "You're on the list." success message (twice: in Liquid and in JS), the customer tag `holding-page`, and all colours in an inline `<style>`.

**Convert to:**
- `sections/nl-password.liquid`, with `templates/password.json` pointing at it.
- **New settings:** logo image (falls back to the shop name), tag text ("LINE 01"; blank hides the tag), success message, customer tag, and pulse on/off (also off under `prefers-reduced-motion`).
- The inline `<style>` becomes `{% stylesheet %}` reading the step 3 tokens.
- The hidden staff-login hotspot stays.

## Other hardcoded content (outside the four modules)

| Where | What's hardcoded | Suggested conversion |
|---|---|---|
| `product.liquid` L90 | Eyebrow "Shinsei Line — No. 001" | Product metafield `nl.eyebrow` (single line), falling back to a section setting |
| `product.liquid` L134–148, 196–203 | Drop-gating copy: "First access.", "Not recognized.", "Not yet available", "Departed.", "LINE 01 has closed." | Section settings (text) under a "Drop states" header |
| `product.liquid` L289–301 | Info accordion: production lead time, returns, shipping countries, duties | Rich-text block `nl-accordion-item`, so you can add or remove accordions in the editor |
| `product.liquid` L174–248 | Modal labels and success copy | Section settings; delete the unreachable Notify me modal |
| `layout/theme.liquid` | Nav links, footer links, © line, logo | Move into the existing `header`/`footer` sections. Nav and footer read Shopify menus (Admin › Navigation); logo becomes an image setting |
| `home.liquid` | Hero image and copy, clock cities (LOS/TYO), three line-selector stops, three product-line cards, "CURRENT LINES / 01 ACTIVE" | Blocks: `nl-line-stop` (image, name, subline), `nl-city-clock` (label, IANA time zone), `nl-line-card` (product picker, status). Cards read price and URL from the picked product |
| `page-about.liquid` | Three About paragraphs | Use the page's own content (`page.content`, edited in Admin › Pages) plus an image setting |
| `page-contact.liquid` | Email address, field labels, success message | Section settings; email defaults to `shop.email` |
| `page-policy.liquid` | 31 hardcoded paragraphs (returns, shipping, terms, privacy) | Shopify's built-in policies (`shop.policies`, edited in Admin › Settings › Policies), so legal copy stops living in code |
| `collection.liquid` | "All Lines", sort and filter labels, "Outerwear", card statuses | Section settings; filters from Shopify's storefront filtering |

**Decision (2026-10-19):** in scope are the four modules plus the rest of the product page (eyebrow, drop-state copy, Info accordion, modal copy). Home, header/footer, About, Contact, Policy and Collection stay hardcoded for now. The unreachable Notify me modal was deleted.

## Proposed metafield and metaobject definitions

The exact admin steps go in each module's `metafields.md` in step 4. These are the definitions to approve.

### Metaobject `nl_spec`: one spec row
| Field key | Name | Type | Validation |
|---|---|---|---|
| `label` | Label | Single line text | Required, max 40 characters |
| `body` | Body | Multi-line text | Required |

Display name: `label`. Storefront access: on.

### Product metafield `nl.specs`
Type: list of metaobject references → `nl_spec`. Name "Specifications". Storefront access: on.

Kagemi entries: Design / Material / Construction / Fit, with the brief's copy.

### Metaobject `nl_size_row`: one measurement row
| Field key | Name | Type | Validation |
|---|---|---|---|
| `label` | Measurement | Single line text | Required (e.g. "Chest") |
| `values_cm` | Values (cm) | List of decimal numbers | Required, min 0, one value per size, in size order |

### Metaobject `nl_size_chart`
| Field key | Name | Type | Validation |
|---|---|---|---|
| `title` | Title | Single line text | Required (e.g. "Kagemi overcoat") |
| `sizes` | Sizes | List of single line text | Required (S, M, L, XL) |
| `rows` | Rows | List of metaobject references → `nl_size_row` | Required |
| `note` | Fit note | Multi-line text | Optional |
| `default_unit` | Default unit | Single line text, choices `in` / `cm` | Default `in` |

### Product metafield `nl.size_chart`
Type: metaobject reference → `nl_size_chart`. Name "Size chart". Storefront access: on.

Kagemi chart:

| | S | M | L | XL |
|---|---|---|---|---|
| Chest | 56 | 58 | 61 | 64 |
| Shoulder | 50 | 51 | 52 | 53 |
| Length | 119 | 122 | 124 | 127 |
| Sleeve | 60 | 61 | 62 | 64 |

Note: "Unisex. Cut with room to layer. Women may prefer one size down. Measurements may vary ±1 cm."

### Product metafield `nl.eyebrow` (in scope)
Single line text, e.g. "Shinsei Line — No. 001".

## Naming

- Metafield namespace `nl`, metaobject types prefixed `nl_`. Shopify allows letters, numbers, underscores and hyphens there; underscores match how setting IDs have to work.
- Files and custom elements: `nl-spec-list`, `nl-size-chart`, `nl-gallery`, `nl-password`.
