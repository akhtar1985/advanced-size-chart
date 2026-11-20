# Changelog

## Phase 5 – Billing and compliance

- `worker/index.js`: Cloudflare Worker handles all 3 mandatory compliance webhooks (`customers/data_request`, `customers/redact`, `shop/redact`) with HMAC-SHA256 verification. No PII stored — acknowledgement only.
- `worker/wrangler.toml`: Worker deployment config. Secret `SHOPIFY_WEBHOOK_SECRET` set via `wrangler secret put`.
- `shopify.app.toml`: Registered 3 compliance webhook subscriptions pointing to Worker URL.
- Feature gating: Free plan limited to 3 charts (gate in `ChartsPage`). Rules page gated behind Pro. Client-side only — Worker is authoritative.
- Upgrade banner shown when free limit reached.

## Phase 4 – Find my size and Markets

- `size-chart.js`: Added "Find My Size" calculator panel inside the modal — inputs for height, chest/bust, waist, hips; fit preference (snug/regular/loose); algorithm converts to cm, computes distance to each row, applies fit offset, returns nearest size + fallback.
- `size-chart.js`: `size_selected` dataLayer event fires on table row click. `size_calculator_used` fires on calculator submit. `chart_opened` already present.
- `size-chart.js`: `marketUnit` and `marketSizeSystem` from Liquid injected into chart data; JS uses them as default unit/system before localStorage preference.
- `size_chart.liquid`: Markets — reads `localization.country.iso_code`, maps to unit (US/LR/MM → in, others → cm) and size system (GB → UK, DE/FR/etc → EU, IN → IN, JP → JP, AU → AU). Injects `marketUnit` and `marketSizeSystem` into both chart data and settings JSON.
- `size-chart.css`: Calculator styles added.

## Phase 3 – Admin editor (App Home)

- Replaced FAQ App Home with Size Chart admin UI
- `ChartsPage`: list, search, duplicate, delete; onboarding 4-step quick-start guide
- `ChartEditorPage`: table grid editor, add/remove rows & columns, unit per column, size systems, CSV import, CSV/JSON export, 15 preset templates
- `RulesPage`: add/reorder/delete assignment rules (collection, vendor, product_type, tag, all)
- `SettingsPage`: global display defaults (mode, unit, button text, color, radius)
- `shared/models/sizeChart.ts`: full CRUD for metaobjects + shop metafields via GraphQL

## Phase 2 – Theme app extension

- Replaced star-rating extension with size chart extension
- `blocks/size_chart.liquid`: app block for product pages
- `blocks/size_chart_floating.liquid`: app embed floating button
- `assets/size-chart.js`: vanilla JS renderer
- `assets/size-chart.css`: responsive styles

## Phase 1 – Data model

- Updated `shopify.app.toml`: declared `size_chart` metaobject, product metafield, shop metafields
- Added `docs/schema.md`
