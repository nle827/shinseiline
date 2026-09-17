# SHINSEI LINE — Brand & Project Context for Claude Code

This file gives you everything you need to work on the Shinsei Line website.
Read this before making any changes. Every decision should pass through this lens.

---

## What this project is

A local HTML/CSS/JS preview of a custom Shopify Liquid theme for **Shinsei Line**,
a luxury apparel brand. The preview lives in this folder as static HTML files.
Once design is locked here, changes are ported into the Shopify Liquid theme.

**Files in this project (`shinsei-preview/`):**
- `index.html` — Home page
- `product.html` — Product detail page (PDP)
- `about.html` — About page
- `contact.html` — Contact page
- `policy.html` — Policy page
- `shop.html` — Shop / listing page
- `shinsei-preview.css` — Base tokens, reset, and shared component styles (header, hero, forms, cart drawer, accordions, etc.)
- `shinsei-home.css` — The current site-wide visual skin. Despite the filename and its own internal comment ("Applied only to index.html"), every page ships `<body class="home-page">` (product.html adds `pdp-page` too), so **these overrides apply everywhere**, not just the home page. This is where most of the real, current look lives — treat it as co-equal with `shinsei-preview.css`, not a homepage-only add-on.
- `shinsei-preview.js` — Interactions (cart drawer, accordions, variant selection)
- `shinsei-home.js` — Hero drag/carousel, transit-map animations, city clocks, line-selector — loaded on every page alongside `shinsei-preview.js`
- `emails/` — Standalone marketing email templates (table-based HTML, inline CSS, no external stylesheets/JS — see the "Email templates" section below)

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

### Live transit motifs (currently implemented, not just referenced)
The "transit system" idea isn't only conceptual — it's built into the home page markup/CSS today:
- **City clocks** (`.city-clock`, LOS / TYO) flank the hero — small analog SVG clock faces with live-styled hands
- **Line selector** (`.line-selector`) — a horizontal dot-and-track "subway line" control below the hero, with a fill that animates between nodes, chevron dividers, and a pulsing ring on the active stop
- **Transit map annotations** (`.map-annotation`, `.transit-map-svg`) — coordinate-style corner labels and an animated line-draw SVG map used in earlier hero treatments
- **Grain/noise overlay** — `.home-page::before` lays a subtle animated-noise SVG (7% opacity) over the entire page as a fixed, full-viewport texture
These are real, current visual signatures of the brand — reach for them (or their spirit) before inventing new decorative motifs.

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

**⚠️ This section describes what is actually implemented today** (verified against
`shinsei-preview.css` and `shinsei-home.css` directly), which has drifted from the
original aspirational spec in places. Where it matters, the old intent is noted —
use judgment about which one to extend.

### Colors

Base tokens, defined in `:root` in `shinsei-preview.css`:
```css
--bg:         #FAFAFA   /* Near-white. The museum void. */
--bg-true:    #FFFFFF   /* Pure white for form inputs only */
--ink:        #111111   /* Near-black. Primary text and UI. */
--ink-mid:    #555555   /* Secondary text, descriptions */
--ink-light:  #999999   /* Labels, eyebrows, placeholders */
--border:     #E2E2E2   /* Hairline borders, dividers */
--accent:     #1A1A2E   /* Deep navy-black. Hover states, CTA hover. */
```

`shinsei-home.css` layers a **second, overlapping token set** scoped to `.home-page`
(i.e. every page) that most current components actually pull from:
```css
--bg-primary:    #FAFAFA   /* same as --bg */
--bg-secondary:  #F5F5F5   /* section backgrounds, e.g. editorial statement */
--bg-dark:       #111111   /* cart drawer — see below, cart is dark-themed now */
--text-primary:  #0D0D0D   /* near-black — slightly darker than --ink */
--text-secondary:#6A6A6A   /* secondary text — replaces --ink-mid in new components */
--text-ghost:    #AAAAAA   /* faintest labels/placeholders — replaces --ink-light */
--rule:          #D8D8D8   /* hairline dividers in new components — slightly darker than --border */
```
When building something new: prefer the `--text-*` / `--rule` / `--bg-*` tokens, since
that's the set the current homepage, PDP, and product-line components actually use.
Treat `--ink`/`--ink-mid`/`--ink-light`/`--border` as the legacy set still backing older
shared components (forms, size chart, some page shells) — don't invent a third set.

**Color philosophy (unchanged):**
- The palette is achromatic with one deep accent (`--accent`, rarely used today — mostly reserved)
- No color is used decoratively — only functionally
- No gradients (one legacy exception: `.hero-void` — unused now). No shadows, with two
  current exceptions: `.line-card-media` has a soft drop shadow, and a couple of overlay
  panels use `backdrop-filter: blur()`
- If a color isn't in one of the two token sets above, it needs a strong justification

### Typography

**The actual typeface today is not EB Garamond/Space Mono — it's Helvetica Neue,
used for everything.** Both `--font-display`/`--font-ui` (home tokens) and
`--font-serif`/`--font-mono` (base tokens) all resolve to the same stack:
```css
'Helvetica Neue', Helvetica, Arial, sans-serif
```
The typographic contrast now comes from **weight and tracking**, not a serif/mono pairing:
- **Display text** (hero heading, editorial statement, PDP title, footer wordmark):
  Helvetica Neue at light weights (200–300), tight/negative letter-spacing (around `-0.01em`
  to `-0.03em`), never italic on the home page (italic survives only in a few older,
  currently-unused base classes like `.about-heading`/`.principle-text`)
- **UI / label text** (nav, eyebrows, prices, captions, buttons): same Helvetica Neue
  stack, uppercase, wide letter-spacing (`0.1em`–`0.25em`), regular weight
- **One serif accent survives:** product/line names (`.line-card-name`) render in
  `'EB Garamond', Georgia, 'Times New Roman', serif` at 15px, normal style, normal weight
  — this is the *only* place the original Garamond identity still appears in the live UI.
  It reads as a deliberate accent against the sans-serif system, not the dominant voice.
- **Nav / cart / search triggers** specifically use `'Raleway', 'Segoe UI', Arial, sans-serif`
  at weight 600 — a second sans creeping in alongside Helvetica Neue. Worth consolidating
  eventually, but that's how it reads today.

**Legacy/dead font imports** — present in the code but not actually rendered anywhere
(don't build on these, and flag for cleanup if you're ever asked to tidy the CSS):
- `Bebas Neue` — imported and used on `.hero-heading` in the base CSS, but `shinsei-home.css`
  overrides `.hero-heading` back to Helvetica Neue on every page, so it never shows
- `Space Mono` — imported via `@import` in `shinsei-preview.css`, never referenced by any
  `font-family` declaration
- `Inter` / `IBM Plex Mono` — linked via Google Fonts `<link>` in every page's `<head>`,
  never referenced by any `font-family` declaration

**Type scale (as implemented, home page):**
```
Hero heading:     42px desktop / 28px mobile — weight 200, letter-spacing -0.03em
Editorial statement: 22px — weight 300, letter-spacing -0.01em, line-height 1.8
PDP title:        20px — weight 200, letter-spacing -0.02em
Body/description: 12px–14px, line-height 1.7
UI labels:        8px–12px, letter-spacing 0.1em–0.25em, uppercase
```
(The base `h1`/`h2` clamp() rules from the original spec still exist in `shinsei-preview.css`
and apply on any element that isn't covered by a `.home-page` override.)

### Spacing rhythm

Base tokens (still defined, still used as scaffolding in older/shared components):
```
--space-xs:   8px
--space-sm:   16px
--space-md:   32px
--space-lg:   64px
--space-xl:   120px
```
In practice, `shinsei-home.css` sections mostly use **explicit pixel paddings** rather than
these tokens — commonly `32px` / `48px` / `64px` / `80px` / `96px` for section and component
padding. When adding to a `shinsei-home.css` component, matching the surrounding explicit
values is more consistent with current practice than forcing in a `--space-*` token; when
adding to `shinsei-preview.css` shared components, keep using the tokens.

### Layout

- Max content width: 1280px, centered
- Max text width: 680px (for editorial copy, about text)
- Padding: 32px on desktop, 16px on mobile
- Grid: 2-column where media + text are paired (1.1fr 1fr — media slightly wider) — this
  is the base/legacy pattern; current home-page grids (product lines, PDP) use their own
  3-column or `25fr 50fr 25fr` layouts instead
- No card shadows as a rule, but `.line-card-media` (the current product-line cards on
  the home page) does have a soft `box-shadow` — a live exception, not yet reconciled
  with the "no shadows" principle
- Borders are 1px solid — `--border` (#E2E2E2) in older components, `--rule` (#D8D8D8)
  in current home-page components — never thicker, never colored

---

## Component rules

### Header
- Fixed, **96px** tall on the home-page skin (base CSS defines 100px via `--header-h`,
  overridden to 96px by `.home-page .site-header`)
- Layout is **Nav left / Logo absolutely centered / Search + Cart right** (not "logo left")
  — the logo sits at `left: 50%` independent of the nav/actions flex row
- Background is **solid** `var(--bg-primary)` (#FAFAFA) with **no blur, no border** on the
  home-page skin — the translucent `rgba(250,250,250,0.92)` + `backdrop-filter: blur(12px)`
  "scrolled" treatment still exists in the base CSS but is disabled everywhere by the
  home-page override
- Nav links: `'Raleway', 'Segoe UI', Arial, sans-serif` weight 600, uppercase, 13px,
  0.2em letter-spacing, `--text-primary`, underline grows in on hover/active (no static
  bottom border)

### Buttons / CTAs
**Current buttons are boxless editorial links, not filled/bordered boxes.** The `.btn`
class (and `.line-card-cta`, `.pdp-add-to-cart`) are all: transparent background, no
border, uppercase Helvetica Neue label, with a 1px underline that animates in width
from 0→100% on hover (`transition: width 500ms cubic-bezier(0.25, 0.1, 0.25, 1)`).
There is no current example of a filled `background: --ink` primary button anywhere
in the live pages — the old filled/bordered button spec below is legacy and effectively
unused, but is still a reasonable pattern to reach for if a genuinely primary,
high-commitment action (e.g. checkout) needs more visual weight than an underline link:
- Primary (legacy pattern, available if needed): `background: --ink`, `color: --bg`,
  `border: 1px solid --ink`, hover `background: --accent`
- No border-radius either way. Buttons/links are rectangular, no shadows, no gradients

### Images / Media placeholders
- Aspect ratio: 3/4 for editorial/PDP-gallery images; **9/16 for the home-page product-line
  cards** (`.line-card-media`) — check which context you're in before assuming 3/4
- Background: `#F0F0F0`, `#EBEBEB`, or `#E8E8E8` for placeholders (all functionally
  interchangeable neutral greys used across different components)
- No border-radius on image containers
- Hover on featured product image: `transform: scale(1.03)`, transition 0.8s

### Accordions
- Trigger: Helvetica Neue (`var(--font-mono)`, which now resolves to the same sans stack),
  uppercase, 0.65rem, flex row with a `+` icon that rotates 45° to read as `×` when open
- Body: shown/hidden by toggling `.open` class (not display:none in CSS)
- Border: hairline top and bottom only

### Cart drawer
- Slides in from the right, `min(440px, 95vw)` wide
- **Dark-themed on every page**: `background: var(--bg-dark)` (#111111), light text
  (`#E8E6E1`) — this is an intentional inversion against the light site, not a bug
- Overlay: `rgba(0,0,0,0.6)` on the home-page skin (base CSS default is `rgba(0,0,0,0.35)`,
  overridden darker)
- Cart items: 4-column grid (thumb / info / qty / remove)

### Forms
- No border-radius on inputs
- Focus state: `border-color: --ink` only — no outline, no glow, no color
- Labels: Helvetica Neue, uppercase, 0.65rem

### Email templates (`emails/`)
Standalone from the rest of the site — these are sent through email clients, not rendered
in a browser, so different constraints apply:
- Table-based layout, all CSS inline (no `<link>` to `shinsei-preview.css`/`shinsei-home.css`)
- No CSS Grid/Flexbox, no external stylesheets, no JS, no `@font-face` web fonts
- Font stack: `'Helvetica Neue', Helvetica, Arial, sans-serif` only — it's already the
  brand's real typeface and needs no substitution to be email-safe
- Pull hex values directly from the `--text-*`/`--bg-*`/`--rule` tokens above so an email
  reads as unmistakably Shinsei Line without needing any brand-system translation
- Skip the grain/noise overlay and any SVG-driven motifs (transit map, clocks, line
  selector) — too unreliable across email clients; hairline rule dividers and generous
  negative space carry the brand identity instead
- See "How to preview an email template" below

---

## Motion

**Philosophy:** Motion should feel like a transit system — purposeful, timed, not decorative.

- Page load: `fadeUp` — opacity 0→1, translateY 8px→0, 0.4s cubic-bezier(0,0,0.2,1)
  (note: both `shinsei-preview.css` and `shinsei-home.css` define a `@keyframes fadeUp`
  with slightly different distances; since `shinsei-home.css` loads second, its version —
  8px, not 12px/16px — is the one that actually renders everywhere)
- Cart drawer: `translateX(100%)→0`, 0.4s cubic-bezier(0,0,0.2,1)
- Cart overlay: background opacity 0→0.6 on the current dark cart skin (base default is 0.35)
- Image hover: `scale(1.03)`, 0.8s — slow and deliberate
- Underline/CTA hover: width 0→100%, 500ms cubic-bezier(0.25, 0.1, 0.25, 1) — this is now
  the dominant hover motion (buttons, product-line CTAs, footer links), not a background swap
- Nav link hover: color + underline width, 200ms ease
- Accordion: icon rotation 0.3s
- Line-selector track fill / pulse ring: track fill transitions width over 0.5s on the same
  cubic-bezier; the active node has a continuous 2.2s pulsing ring animation (`lsPulse`)

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

1. **The font system** — Helvetica Neue (light weights for display, uppercase/tracked
   for UI) is the real current typeface everywhere. EB Garamond survives only as the
   small serif accent on product/line names — don't expand its role without being asked,
   and don't reintroduce Space Mono/Bebas Neue/Inter/IBM Plex Mono, which are dead imports.

2. **The color palette** — achromatic, pulling from either the base (`--ink`/`--border`/etc.)
   or home (`--text-*`/`--rule`/etc.) token sets, with `--accent` as the only depth.
   Do not introduce new colors without explicit instruction, and don't mix arbitrary
   hex values in when a token already covers the case.

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
- This file backs shared/legacy components (forms, size chart, base header/hero/cart
  scaffolding) — many of its rules are silently overridden by `shinsei-home.css` for
  anything that actually renders on the current pages, so when a change here doesn't
  seem to show up, check for a `.home-page` override before assuming the change failed

When editing `shinsei-home.css`:
- This is the current, real site skin — loaded on every page via `<body class="home-page">`,
  not just `index.html`, despite the filename and the file's own header comment
- Its own token block (`--text-*`, `--bg-*`, `--rule`) is what current components pull from
- Watch for duplicate `@keyframes`/selector names shared with `shinsei-preview.css` (e.g.
  `fadeUp`) — since this file loads second, its version wins globally, which can quietly
  change behavior in the base file's own components

When editing HTML files:
- Class names follow the pattern: `site-header`, `hero-content`, `fp-label` (no BEM, flat)
- Every page ships `<body class="home-page">` (product.html adds `pdp-page`) — this is what
  makes the current skin apply; don't remove it when copying page structure
- Each page has identical header, footer, and cart drawer markup — if you change one, change all
- Images use placeholder divs/blocks with a neutral grey background (`#F0F0F0`/`#EBEBEB`/`#E8E8E8`)
  — leave alt hooks

When editing `shinsei-preview.js` / `shinsei-home.js`:
- Functions are global and named by action: `toggleCart()`, `toggleAccordion()`, `selectVariant()`
- `shinsei-home.js` owns the hero drag/carousel, transit-map draw-in, city clocks, and
  line-selector interactions — both scripts load on every page
- No frameworks — vanilla JS only
- Cart interactions are simulated locally (no real Shopify API in preview)

## How to preview an email template

Files under `emails/` are plain static HTML with everything inlined — no build step,
no dev server needed:
- **Fastest check (layout/copy):** open the file directly in a browser
  (e.g. double-click `emails/email-01-list-confirmation.html`, or from a terminal:
  `start "" "emails\email-01-list-confirmation.html"` on Windows). This renders the
  table layout and inline styles accurately for a quick look, but a browser is more
  forgiving than real email clients — don't treat it as final sign-off.
- **Real inbox rendering (recommended before sending):** use an email-client testing
  service such as Litmus or Email on Acid, or send yourself a test send through
  whatever ESP/platform will actually deliver the campaign — these catch Outlook's
  Word-based rendering engine, dark-mode color flips, and clipped preheader text that
  a browser preview won't show.
- Before either check, drop in real image URLs for the two placeholder `<img src="REPLACE-WITH-...">`
  tags (logo and campaign image) — until then the browser will show broken-image icons
  where the neutral placeholder background color would otherwise carry the layout.

---

## Shopify notes (for when changes port to Liquid)

- The preview CSS maps 1:1 to `assets/shinsei.css` in the Shopify theme
- HTML structure maps 1:1 to the corresponding `.liquid` section files
- Liquid-specific features (product JSON, cart AJAX) are handled in `assets/shinsei.js`
- Template routing: `index.json` → home, `product.json` → PDP, `page.about.json` → about,
  `page.contact.json` → contact
- Do not use Liquid syntax in the preview HTML files — use static placeholder values instead
