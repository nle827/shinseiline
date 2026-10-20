# Shinsei Line theme

Custom Online Store 2.0 theme for [theshinseiline.com](https://theshinseiline.com), built on Shopify's [Skeleton theme](https://github.com/Shopify/skeleton-theme) (MIT, see `LICENSE.md`).

## Layout

| Folder | Contents |
|---|---|
| `layout/` | `theme.liquid` (header, cart drawer, asset loading) and `password.liquid` |
| `sections/` | One section per page type (`home`, `product`, `page-about`, `page-policy`, …) plus header and footer groups |
| `blocks/` | Theme blocks. Skeleton's `group` and `text` for now; `nl-` blocks arrive with the modular refactor |
| `snippets/` | `meta-tags`, `css-variables`, `image`, `card-image` |
| `assets/` | `shinsei-global.*` on every page, `shinsei-home.*` on every page, `shinsei-pdp.*` on product pages, `shinsei-shop.css` on collection and search pages, plus brand images |
| `config/` | Theme settings, including the LINE 01 drop-window dates and passcode hash |
| `templates/` | JSON templates, one per page type |
| `docs/` | Refactor brief and Shopify's Skeleton AI guide. Not uploaded to Shopify |

## Conventions

- **File names:** kebab-case, no spaces.
- **Prefixes:** `shinsei-` for files specific to this brand. `nl-` for portable modules (files, CSS classes, custom elements such as `<nl-size-chart>`). Setting IDs use `nl_`, because Shopify setting IDs can't contain hyphens.
- **CSS:** classes are flat and descriptive (`pdp-gallery-count`, `line-card-media`). New modules use BEM under their `nl-` block name.
- **JS:** vanilla only. Global page scripts in `assets/`; new modules ship one custom element each.
- **Theme Check:** `shopify theme check` must report zero errors before anything is pushed.

## Design tokens

Colours, fonts, widths and spacing are theme settings (Theme settings › Colors / Typography / Layout and spacing). `snippets/nl-tokens.liquid` outputs them as CSS variables on `:root` in every layout:

| Group | Variables |
|---|---|
| Colours | `--nl-color-bg`, `-bg-alt`, `-white`, `-placeholder`, `-card`, `-text`, `-ink`, `-text-mid`, `-text-secondary`, `-text-light`, `-text-ghost`, `-on-dark`, `-rule`, `-border`, `-accent`, `-error` |
| Type | `--nl-font-sans` (text stack), `--nl-font-serif` and `--nl-font-nav` (Shopify font pickers), plus `-weight` variants |
| Layout | `--nl-page-width`, `--nl-text-width`, `--nl-space-xs` … `--nl-space-xl` |
| Motion | `--nl-ease`, `--nl-ease-out` |

New `nl-` modules use only `--nl-*` variables. The older names in `shinsei-global.css` and `shinsei-home.css` (`--ink`, `--bg-primary`, `--font-ui` …) are aliases of these, kept so existing rules didn't have to change. Values left literal on purpose: black/white overlays at fixed opacity, and three greys inside the dark cart drawer.

## Working on it

```bash
shopify theme check
shopify theme push --theme <theme-id> --nodelete
```

Never use `--live` or `shopify theme publish` from a feature branch. See `docs/MODULAR-REFACTOR.md` for which theme IDs are safe.
