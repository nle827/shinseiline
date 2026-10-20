# Shinsei Line theme: cleanup and modular refactor (portfolio copy)

> **First:** the repo already has a CLAUDE.md, so don't overwrite it. Save this brief as `docs/MODULAR-REFACTOR.md` in the theme folder, then add one line near the top of the existing CLAUDE.md: "For the cleanup and modular refactor, follow docs/MODULAR-REFACTOR.md. Its hard rules override anything else here." Where this brief says "this file", it means docs/MODULAR-REFACTOR.md. Then start with step 0.

## Goal
Refactor the Shinsei Line Shopify theme into a modular, theme-editor-friendly build, and extract its custom features into a reusable library I can drop into other client themes. This is a portfolio piece. It runs on an **unpublished duplicate theme**, never the live site.

Two outputs:
1. **Shinsei Line – Modular**: a working copy of the store theme where every custom feature is editable in the Shopify theme editor (no content hardcoded in Liquid).
2. **nl-modules**: a separate library repo where each feature is a self-contained, portable module with docs, ready to install into any Online Store 2.0 theme (Dawn, Horizon, etc.).

## Context
- Store: `menacity-clothing.myshopify.com` (theshinseiline.com). This is the real store.
- `shinsei-line.myshopify.com` is an unused store. Never deploy to it.
- Live theme: #131621257349 "Shinsei Line (cancellation update)". **Never push to it, never publish anything.**
- Backup theme: #131532226693 "Shinsei Line – LINE 01".
- Portfolio duplicate theme: named **"Shinsei Line – Modular"** (already duplicated in the admin). Find its ID in step 0 and use only that ID for pushes.
  - **Duplicate theme ID: #131725852805** (confirmed via `shopify theme list` on 2026-10-19). Use only this ID.
  - Note (step 0, 2026-10-19): the live theme #131621257349 is currently named "Shinsei Line - Line 01 Website". Backup #131532226693 did not appear in `shopify theme list`.
- Theme code (git-tracked): `shinsei-preview/shinsei-theme/`. Repo: github.com/nle827/shinseiline.
  - Note (found in step 0): the git repo root is `shinsei-preview/`, not the theme folder, and the default branch is `master` (there is no `main`). Wherever this brief says "main", read `master`.
- `D:\SHINSEI LINE\shinsei-theme` is an old April copy. Never edit or read from it.
- The theme is based on Dawn with custom sections and snippets added.
- Brand: dark, monochrome, quiet, cinematic luxury outerwear. No logos, no color accents, minimal UI. Any new UI must match the existing look.

## Custom features to modularize (in this order)
1. **Product specifications dropdown.** Currently a hardcoded `construction_blocks` capture in `sections/product.liquid`, and the copy is outdated. Correct copy:
   - Design: "Structured like a European overcoat. Shaped like a traditional kimono and hakama, with an obi-style belt, pleats and a wide hem."
   - Material: "Shell: 100% wool twill, black. Lining: 100% viscose. Imported."
   - Construction: "Double-breasted, four-button front with notch lapel. Structured shoulder. Waist panel with self belt. Front pockets. Fully lined."
   - Fit: "Unisex. Relaxed through the body and sleeve. Falls below the knee. Model is 6'1" and wears size M."
2. **Size chart.** S to XL, IN/CM toggle, fit note, no sideways scroll on mobile.
3. **Swipe gallery** with the "01 / 04" counter on the product page.
4. **Password page.** LINE 01 tag, "Arriving soon.", pulsing Request access box.

## Architecture rules
- **Sections** get a full `{% schema %}` with settings, blocks and presets so they appear under "Add section" in the theme editor.
- **Theme blocks** (`/blocks` folder) for reusable pieces (spec row, size chart, gallery slide) so they can nest and be reused across sections.
- **Content lives in data, not code.** Product specs become product **metafields**; the size chart becomes a **metaobject** (rows of size + measurements, unit toggle) referenced from the product. Sections read them as dynamic sources, with editor-entered fallbacks.
- **Design tokens** (colors, type, spacing) come from `settings_schema.json` and are output as CSS variables. Modules use only those variables, so a new theme restyles them by changing tokens.
- **JS** is a small custom element per feature (no frameworks, no jQuery), loaded only when its section or block is on the page. Respect `prefers-reduced-motion`.
- **CSS** scoped per module (`{% stylesheet %}` or a module asset file). Mobile first, no horizontal scroll.
- **Namespace** every file, class, setting ID and custom element with `nl-` so modules never collide with the host theme.
- Accessible: keyboard operable, visible focus, proper ARIA on toggles and the gallery.

## Library format (`nl-modules` repo)
One folder per module:
```
nl-size-chart/
  blocks/nl-size-chart.liquid
  sections/nl-size-chart-section.liquid   (if needed)
  assets/nl-size-chart.css
  assets/nl-size-chart.js
  metafields.md        (definitions to create: namespace, key, type, validations)
  README.md            (what it does, install steps, settings, screenshots)
```
Plus a root README that works as the portfolio case study: the problem with the original hardcoded build, the modular approach, before/after screenshots, and how to install a module into a fresh Dawn theme in under 10 minutes.

## Hard rules
- Work only inside this repo (theme code lives in `shinsei-preview/shinsei-theme/`) on the branch `modular-refactor`. Never commit to main, except the one approved push of existing commits in step 0.
- Preview with `shopify theme dev` or push only to the portfolio duplicate: `shopify theme push --theme <DUPLICATE_ID>`. Never use `--live`, never run `shopify theme publish`, never push to #131621257349 or #131532226693.
- Metafield and metaobject definitions: write them out in `metafields.md` and give me exact steps to create them in the admin. Don't try to create them through the CLI.
- Ask me before any command that writes to the store, deletes files, or rewrites git history.
- Run `shopify theme check` after each module and fix every error.

## Process (stop at each checkpoint for my approval)
0. **Setup (do all of this for me, then report back).**
   - Confirm you're in `shinsei-preview/shinsei-theme/` and it's a git repo pointing to github.com/nle827/shinseiline. If VS Code is open on a different folder, tell me the exact path to open instead.
   - Check that Node and Shopify CLI are installed (`node -v`, `shopify version`). If the CLI is missing, install it with `npm install -g @shopify/cli`.
   - Run `shopify theme list --store menacity-clothing.myshopify.com`. If it asks me to log in, tell me to finish the browser sign-in, then rerun it. Find the theme named "Shinsei Line – Modular", write its ID into this file under Context, and use only that ID from now on. If it isn't there, stop and tell me.
   - Run `git status` and `git log origin/main..main`. Commits 5cb6250 (size chart, specs dropdown, swipe gallery, password page) and 5319783 (size note 8px) should be local but unpushed. Show me what will be pushed, ask me, then push them to origin/main. This is the only time anything goes to main.
   - Check that `sections/password.liquid`, `templates/password.json`, `snippets/meta-tags.liquid` and `sections/page-policy.liquid` are tracked in git. List any that aren't, and add them in a commit after I confirm.
   - Pull the duplicate theme's current files down (`shopify theme pull --theme <DUPLICATE_ID>` into a temporary folder outside the repo) and diff them against the repo. Tell me if the duplicate has changes the repo doesn't, since the live theme was edited in the admin. Don't overwrite anything until I decide.
   - Create the branch `modular-refactor` from the updated main.
   - Create the library repo: if the GitHub CLI (`gh`) is installed and logged in, run `gh repo create nle827/nl-modules --public` and clone it next to the theme folder. If `gh` isn't available, install it or tell me the two clicks to create the repo on github.com, then clone it.
   - Capture "before" screenshots for the case study: start `shopify theme dev --theme <DUPLICATE_ID>` (it may ask for the storefront password; ask me for it), then use a headless browser (install Playwright if needed) to screenshot the product page, the open size chart, the gallery and the password page at 390px and 1440px widths. Save them in `nl-modules/case-study/before/`.
   - Report what you did, anything that failed, and anything you need from me. **Checkpoint.**
1. **Clean up and organize the codebase** (on the `modular-refactor` branch).
   - Inventory the whole repo, not just the theme: the theme files, the static HTML preview in `shinsei-preview/shinsei-preview/` (not updated since September), stray scripts, exports, backups and loose assets.
   - For each theme file, check whether it's actually used: grep for every `render`, `section`, `include` and asset reference, and check every `templates/*.json` and `config/settings_data.json`. Flag dead sections, snippets, assets, unused CSS and JS, leftover Menacity-era files, duplicates and commented-out code.
   - Propose a cleanup plan as a table: file, what it is, used or unused (with the evidence), and the action (keep, rename, move, archive, delete). Also propose naming conventions (kebab-case, `nl-` prefix for custom work, consistent asset names) and a clean folder layout for anything outside the theme (for example `/theme`, `/preview-archive`, `/docs`, `/scripts`). Remember that Shopify themes require their fixed top-level folders (assets, blocks, config, layout, locales, sections, snippets, templates), so don't restructure inside the theme beyond renames.
   - **Checkpoint: don't delete, move or rename anything until I approve the plan.** Prefer archiving over deleting for anything uncertain, and do it in small, separate commits so each change is easy to revert.
   - After approval, apply it, run `shopify theme check`, preview on the duplicate to confirm nothing broke, and update the repo README to describe the structure and conventions. **Checkpoint.**
2. **Audit.** List every hardcoded piece of content and custom feature in the theme, where it lives, and how you'll convert it. Propose the metafield/metaobject definitions. **Checkpoint.**
3. **Tokens.** Move colors, type and spacing into theme settings and CSS variables. **Checkpoint.**
4. **One module at a time** in the order above: build it in the theme, verify it in the editor on the duplicate, then copy it into `nl-modules` with its README. **Checkpoint after each module.**
5. **Portability test.** Install one module (size chart) into a clean, unmodified Dawn theme to prove it's portable, and document the steps.
6. **Case study.** Write the root README with before/after (including the cleanup: what was removed and why) and the screenshots from step 0.

## Progress log

_Last updated 2026-10-21._

| Step | Status | Notes |
|---|---|---|
| 0. Setup | Done | Duplicate #131725852805. Nothing needed pushing to `master`: e8752b2 and b54d571 were already on origin. `nl-modules` is a **local-only** git repo at `D:\SHINSEI LINE\nl-modules`; the user will create the GitHub remote later. "Before" screenshots are in `nl-modules/case-study/before/` |
| 1. Cleanup | Done | 15 small commits; see the README for the layout. Matches live pixel for pixel (`nl-modules/case-study/after-cleanup/`) |
| 2. Audit | Done | `docs/AUDIT.md`. Scope: four modules plus the rest of the PDP (eyebrow, drop-state copy, Info accordion). Notify me modal deleted |
| 3. Tokens | Done | `snippets/nl-tokens.liquid` plus `nl_*` settings (Colors, Typography, Layout and spacing, body line height). Fonts moved from Google to Shopify's font library. Theme Check: 0 offenses |
| 4.1 Specs module | Done | `blocks/nl-spec-list.liquid`, `blocks/_nl-spec-row.liquid`, `assets/nl-spec-list.{css,js}`. On 2026-10-21, with the user's approval, the `nl_spec` metaobject definition, the `nl_modules.specs` product metafield and Kagemi's four entries were created through the Shopify connector (Admin GraphQL). Both blocks now render from the metafield (`data-nl-source="metafield"`), pixel-identical to live. The fallback rows in `templates/product.json` stay as a safety net. Library copy is in `nl-modules/nl-spec-list/` |
| 4.2 Size chart | Next | Planned design in `docs/AUDIT.md`: `nl_size_chart` + `nl_size_row` metaobjects, cm only (inches computed, verified for all 16 values), `<nl-size-chart>` toggle |
| 4.3 Gallery | To do | |
| 4.4 Password page | To do | |
| PDP extras | To do | Eyebrow metafield `nl_modules.eyebrow`, drop-state copy, Info accordion |
| 5. Portability (Dawn) | To do | Dawn's main-product can't host theme blocks; each module ships an `nl-*-section` wrapper. Test it here |
| 6. Case study | To do | |

### Working notes for the next session

- **Pushing to the duplicate:** first confirm it's `[unpublished]` in `shopify theme list`, then run `shopify theme push --theme 131725852805 --nodelete --ignore config/settings_data.json` from `shinsei-theme/`. Ignoring `settings_data.json` protects the duplicate's drop passcode hash. The user accepted duplicate pushes for verification.
- **Don't** use `shopify theme dev --theme <dup>`: it uploads local `settings_data.json`.
- **Visual checks:**
  1. Run `SF_PW=<storefront password> node scripts/screenshots.js <out> [theme-id]` against live #131621257349 and the duplicate, then pixel-diff the two sets. Ask the user for the password; it isn't stored in the repo.
  2. Expect two kinds of noise: the clocks and pulse animations, and the home line selector, which auto-advances every 5s, so a desktop home page differing by about 16% means a different stop. The desktop nav also shows ~20px of font anti-aliasing.
  3. Run `npm install` inside `scripts/` before the first use.
- **Metafield namespace is `nl_modules`**, not `nl`: Shopify rejects namespaces shorter than 3 characters. Metaobject types are `nl_*`.
- **Shopify wraps every theme block** in `<div class="shopify-block">`, even when the block renders nothing. Give that wrapper `display: contents` inside flex/grid containers, and don't rely on `dl > dt` style parent/child HTML rules for block children.
- The root `CLAUDE.md` is gitignored. Its pointer to this file exists only locally.

## Definition of done
- The repo is organized with documented conventions, and no file was removed without my approval.
- Every listed feature is editable in the theme editor on the duplicate, with no content hardcoded in Liquid.
- Theme Check passes with no errors.
- Each module installs into stock Dawn by following its README alone.
- The live theme and backup theme are untouched.
