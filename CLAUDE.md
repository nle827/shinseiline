# SHINSEI LINE — Brand & Project Context for Claude Code

This file gives you everything you need to work on the Shinsei Line website.
Read this before making any changes. Every decision should pass through this lens.

---

## What this project is

A local HTML/CSS/JS preview of a custom Shopify Liquid theme for **Shinsei Line**,
a luxury apparel brand. The preview lives in this folder as static HTML files.
Once design is locked here, changes are ported into the Shopify Liquid theme.

**Files in this project:**
- `index.html` — Home page
- `product.html` — Product detail page (PDP)
- `about.html` — About page
- `contact.html` — Contact page
- `shinsei-preview.css` — All styles (single source of truth)
- `shinsei-preview.js` — Interactions (cart drawer, accordions, variant selection)

---

## The brand

**Name:** Shinsei Line (新生ライン)
**意味 / Meaning:** 新生 = renewal, new life

**One-sentence brand statement:**
Clothing that carries institutional weight without noise.

**Three brand values — everything maps back to these:**
1. **Quiet Authority** — presence without announcement
2. **Intentional Restraint** — nothing added that doesn't earn its place
3. **Access over Availability** — limited, deliberate, not scarce for scarcity's sake

**What Shinsei Line is not:**
- Not streetwear, not hype, not logo-forward
- Not minimalism as trend — minimalism as conviction
- Not fashion as identity performance — clothing as infrastructure

**Anime is an internal creative influence only** — it informs the world-building
but never surfaces as merchandise, graphics, or reference on the site.

---

## The product

**Debut piece:** The Structured Overcoat — No. 001
- Unisex long overcoat
- European overcoat construction fused with Japanese kosode shoulder treatment
- Fine wool (melton, gabardine, or wool-blend twill at outerwear weight)
- Drop shoulder silhouette, unstructured lining
- Limited to 50 units globally — no restock
- Production via Guangzhou or Dongguan manufacturers (sampling phase)

---

## Visual identity

### Logo system
- **Primary mark:** Kanji 新生 + SL subway roundel + Latin wordmark "SHINSEI LINE"
- **Roundel:** Circle with horizontal bar through centre — references Japanese transit
  iconography (think Tokyo Metro, not TfL). The kanji sits inside the circle.
- **Standalone mark:** The roundel alone works at small scale (favicon, embossing)
- **Latin wordmark:** All-caps, wide letter-spacing, monospaced feel

### Aesthetic references
**Architecture:** Carlo Scarpa (primary — Italian/Japanese synthesis), Tadao Ando,
Japanese Metabolism, Le Corbusier's La Tourette, Peter Zumthor

**Fashion:** Lemaire, The Row, Maison Margiela white room editorial, Issey Miyake

**Photography:** Irving Penn — whitespace with one or two deliberate artifacts

**Speculative/world-building:** Syd Mead, Ghost in the Shell, Blade Runner 2049,
Lebbeus Woods, teamLab

**The environment the brand lives in:**
An infinite white museum void. Flat, glowing blue rectangular floor panels (subtle).
Institutional. Like a transit concourse that has been evacuated and lit for a shoot.

---

## Design system

### Colors

```css
--bg:         #FAFAFA   /* Near-white. The museum void. */
--bg-true:    #FFFFFF   /* Pure white for form inputs only */
--ink:        #111111   /* Near-black. Primary text and UI. */
--ink-mid:    #555555   /* Secondary text, descriptions */
--ink-light:  #999999   /* Labels, eyebrows, placeholders */
--border:     #E2E2E2   /* Hairline borders, dividers */
--accent:     #1A1A2E   /* Deep navy-black. Hover states, CTA hover. */
```

**Color philosophy:**
- The palette is achromatic with one deep accent
- No color is used decoratively — only functionally
- Blue-adjacent tones only appear as accent depth, not as a brand color
- No gradients. No shadows (except backdrop blur on the header)
- If a color isn't in the list above, it needs a strong justification

### Typography

**Heading font:** EB Garamond (Google Fonts)
- Used for: all headings, hero text, product titles, section titles
- Always set in italic when used at display size (h1, h2 in hero/featured contexts)
- Weight: 400 only. Never bold.
- This is the warmth and history in the brand — the serif says "craft"

**UI / Label font:** Space Mono (Google Fonts)
- Used for: nav links, buttons, eyebrows, labels, prices, metadata, captions
- Always uppercase with wide letter-spacing (0.12em–0.18em)
- Weight: 400 only
- This is the institutional cold — the monospace says "system"

**The contrast between these two fonts is the entire typographic personality.**
Garamond = the garment. Space Mono = the label sewn into it.

**Type scale:**
```
Hero heading:    clamp(2.5rem, 6vw, 4.5rem)  — italic Garamond
H1:              clamp(2rem, 5vw, 3.5rem)    — italic Garamond
H2:              clamp(1.5rem, 3.5vw, 2.5rem)
Body:            1rem / 1.65 line-height
UI labels:       0.65rem–0.72rem, 0.12–0.18em letter-spacing, uppercase, Space Mono
```

### Spacing rhythm

```
--space-xs:   8px
--space-sm:   16px
--space-md:   32px
--space-lg:   64px
--space-xl:   120px
```

Use these tokens. Do not introduce arbitrary spacing values.

### Layout

- Max content width: 1280px, centered
- Max text width: 680px (for editorial copy, about text)
- Padding: 32px on desktop, 16px on mobile
- Grid: 2-column where media + text are paired (1.1fr 1fr — media slightly wider)
- No card shadows. No box shadows on containers.
- Borders are always 1px solid `--border` — never thicker, never colored

---

## Component rules

### Header
- Fixed, 64px tall
- Logo left / Nav center / Cart right
- Background: `rgba(250,250,250,0.92)` with `backdrop-filter: blur(12px)`
- Border-bottom: 1px solid `--border`
- Nav links: Space Mono, uppercase, 0.68rem, `--ink-mid`, transition to `--ink` on hover
- Active nav link: `--ink` color + `border-bottom: 1px solid --ink`

### Buttons
- Primary: `background: --ink`, `color: --bg`, `border: 1px solid --ink`
  Hover: `background: --accent`
- Secondary: transparent background, `border: 1px solid --ink`
  Hover: fills to `--ink`
- Font: Space Mono, uppercase, 0.7rem, 0.14em letter-spacing
- Padding: 14px 32px
- No border-radius. Buttons are rectangular.
- No shadows, no gradients

### Images / Media placeholders
- Aspect ratio: 3/4 for product and editorial images (portrait orientation)
- Background: `#F0F0F0` or `#EBEBEB` for placeholders
- No border-radius on image containers
- Hover on featured product image: `transform: scale(1.03)`, transition 0.8s

### Accordions
- Trigger: Space Mono, uppercase, 0.68rem, flex row with `+` / rotates to `×` when open
- Body: shown/hidden by toggling `.open` class (not display:none in CSS)
- Border: hairline top and bottom only

### Cart drawer
- Slides in from right, 440px wide
- Overlay: `rgba(0,0,0,0.35)` on the rest of the page
- Same header/footer pattern as the site
- Cart items: 3-column grid (image / details / remove)

### Forms
- No border-radius on inputs
- Focus state: `border-color: --ink` only — no outline, no glow, no color
- Labels: Space Mono, uppercase, 0.65rem

---

## Motion

**Philosophy:** Motion should feel like a transit system — purposeful, timed, not decorative.

- Page load: `fadeUp` — opacity 0→1, translateY 16px→0, 0.5s ease-out
- Cart drawer: `translateX(100%)→0`, 0.4s cubic-bezier(0,0,0.2,1)
- Cart overlay: background opacity 0→0.35, 0.4s
- Image hover: `scale(1.03)`, 0.8s — slow and deliberate
- Button hover: background color, 0.2s
- Nav link hover: color, 0.2s
- Accordion: icon rotation 0.3s

No bounce. No spring physics. No overshooting.
Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)` default, `cubic-bezier(0, 0, 0.2, 1)` for entrances.

---

## Content voice

**Tone:** Institutional. Declarative. No hedging. No exclamation marks.
Think product copy on a museum object label, or a Japanese railway announcement.

**Examples of on-brand copy:**
- "The Overcoat."
- "Not fashion — infrastructure for the body."
- "Limited to 50. No restock."
- "Structured authority. Unisex construction."
- "Quiet Authority. Intentional Restraint."

**Examples of off-brand copy:**
- "Shop our amazing debut collection!"
- "Crafted with love and care for the modern wardrobe"
- "Free shipping on orders over $X!"
- Anything with emoji

**Eyebrow/label copy:** Space Mono, uppercase, minimal —
"No. 001", "Debut Collection — 2026", "Outerwear", "SS26"

---

## What to preserve in every change

1. **The font pairing** — EB Garamond italic for display, Space Mono for UI.
   These are non-negotiable. Do not substitute.

2. **The color palette** — achromatic with `--accent` as the only depth.
   Do not introduce new colors without explicit instruction.

3. **The rectangular geometry** — no border-radius on buttons, image containers,
   or structural elements. Border-radius only exists on the logo roundel.

4. **The spacing rhythm** — use `--space-*` tokens, not arbitrary px values.

5. **The motion timing** — slow and deliberate. Nothing snappy or bouncy.

6. **The voice** — declarative, institutional, no superlatives.

---

## Things that are intentionally absent

- No hero video autoplay (campaign video is a deliberate section, not background)
- No countdown timers or urgency mechanics
- No popup modals (except the cart drawer, which is a drawer, not a modal)
- No sticky add-to-cart bars
- No customer review sections (for launch)
- No social proof widgets
- No newsletter popup on entry
- No cookie banners (handle separately when needed)

If asked to add any of these, push back and suggest a Shinsei-appropriate alternative.

---

## File editing guidance

When editing `shinsei-preview.css`:
- All CSS custom properties live at the top in `:root` — use them, don't hardcode values
- Sections are clearly commented — add new components in the right section
- Mobile breakpoints: 768px and 480px — keep responsive rules at the bottom

When editing HTML files:
- Class names follow the pattern: `site-header`, `hero-content`, `fp-label` (no BEM, flat)
- Each page has identical header, footer, and cart drawer markup — if you change one, change all
- Images use placeholder divs with `.hero-void` or `.featured-product-media` — leave alt hooks

When editing `shinsei-preview.js`:
- Functions are global and named by action: `toggleCart()`, `toggleAccordion()`, `selectVariant()`
- No frameworks — vanilla JS only
- Cart interactions are simulated locally (no real Shopify API in preview)

---

## Shopify notes (for when changes port to Liquid)

- The preview CSS maps 1:1 to `assets/shinsei.css` in the Shopify theme
- HTML structure maps 1:1 to the corresponding `.liquid` section files
- Liquid-specific features (product JSON, cart AJAX) are handled in `assets/shinsei.js`
- Template routing: `index.json` → home, `product.json` → PDP, `page.about.json` → about,
  `page.contact.json` → contact
- Do not use Liquid syntax in the preview HTML files — use static placeholder values instead
