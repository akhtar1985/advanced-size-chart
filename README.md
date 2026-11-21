# Advanced Size Chart

**Live demo:** https://akhtar1985.github.io/advanced-size-chart/ — the real storefront widget running on a static page: every display mode, the size calculator, height & weight finder and all 8 widget languages.

A Shopify app that adds a size guide to product pages: multiple charts per store, automatic assignment by collection, vendor, product type or tag, per-product overrides, unit conversion, and a "Find my size" calculator.

The app is fully serverless. A single Cloudflare Worker serves the embedded admin app, verifies Shopify session tokens, syncs subscription state, and receives webhooks. All product data lives in Shopify as app-owned metaobjects and metafields, so there is no database to run.

## What merchants get

- **Size charts** stored as `$app:size_chart` metaobjects with any number of tables, columns and rows.
- **Category presets** covering clothing and non-clothing items: T-shirt, dress shirt, women's top, hoodie, jeans, pants, skirt, shorts, dress, jackets, underwear, swimwear, shoes, socks, belts, gloves, hats, rings, watches and glasses/sunglasses. Each creates a finished chart in one click.
- **Assignment rules** by collection, vendor, product type, tag or "all products", plus direct product overrides. A Shopify admin block on the product page also sets or clears the override inline.
- **Storefront options**: size guide button with modal, side drawer, inline, accordion or text-link display (placed next to the variant picker); a floating button from an app embed; or Size guide text links under product titles on collection cards and next to cart line items.
- **Storefront languages**: the widget's own labels (button, calculator, fit feedback, hints) follow the storefront locale in English, French, German, Spanish, Italian, Japanese, Simplified Chinese and Brazilian Portuguese; chart content uses the per-locale chart translations.
- **Units and size systems**: cm/inch conversion, US/EU/UK/IN/AU/JP/IT/FR columns detected automatically, and a default size system that follows the visitor's market.
- **Find my size**: recommends a size from the customer's waist/chest/hip measurements, with the matching row highlighted.
- **Height & weight finder** and **fit feedback** ("Runs small / True to size / Runs large"), with vote totals on the Dashboard; plus **backup & restore** of charts, rules, overrides and settings.
- **15-day free trial**, then the storefront chart hides and editing locks until a plan is active. Nothing is deleted.

## How it fits together

| Piece | Where | Responsibility |
| --- | --- | --- |
| Admin SPA | `admin/` | Static ES modules + Polaris web components inside the Shopify admin iframe. Reads and writes data with the Admin GraphQL API using App Bridge session tokens. |
| Worker | `worker/index.js` | Serves the SPA, exchanges session tokens for offline tokens, syncs billing through the Partner API, writes `$app:billing`, handles webhooks and the hourly cron. |
| Theme app extension | `extensions/theme-extension/` | App block and app embeds that resolve the assigned chart in Liquid and render it from JSON. |
| Admin UI extension | `extensions/product-size-chart/` | Shopify admin block on the product page for setting or clearing the per-product chart override. Preact, built by the Shopify CLI. |
| Data | Shopify | Metaobjects for charts, shop metafields for rules, settings, the storefront index, billing state and product override registry. |

Details of every field and metafield: [docs/schema.md](docs/schema.md).

## Requirements

- Node.js 20+
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) 3.x+ (built with 5.0.2)
- A Cloudflare account (free plan is enough)
- A Shopify Partner account with a public app and a development store

## Setup

Full step-by-step instructions, including secrets, billing plans and theme setup: [docs/deploy.md](docs/deploy.md).

Short version:

```shell
# 1. Create the KV namespace and paste its id into wrangler.toml
npx wrangler kv namespace create SHOPS

# 2. Fill the [vars] and placeholder URLs in wrangler.toml and shopify.app.toml

# 3. Add the two secrets through the Wrangler prompt (never commit them)
npx wrangler secret put SHOPIFY_API_SECRET
npx wrangler secret put SHOPIFY_PARTNER_API_TOKEN

# 4. Deploy the Worker, then the app configuration and theme extension
npm run deploy
```

## Adding a size chart (merchant flow)

1. Open **Size charts**. Under **Start from a product category**, search or filter (tops, bottoms, outerwear, underwear, shoes, accessories, glasses & sunglasses) and click the item you sell. The chart is created with sizes, measurement columns, units, fit notes and measuring tips already filled in. Alternatively click **New size chart** for a blank chart.
2. A confirmation panel appears and shows exactly what was filled (tables, columns, size rows, size systems): click **Show it on all products** (adds an “All products” fallback rule when none exists) or **Assign this chart** to target collections, vendors, types or tags. Use **Review & edit data** to change any cell.
3. In the editor, add or remove columns and rows, import a CSV, or switch the base unit. Size systems such as US/EU/UK are detected from the column names.
4. Add the size guide to the storefront in **Help → Method A/B**, or **Settings → Button placement in the theme**: either the **Size Chart** block on the product template or the **Size Chart Float** app embed (one, not both).

The theme block and app embed only appear once the app has at least one chart and the store is inside its trial or subscription.

## Trial and plans

- Shopify App Pricing plans are defined in the Partner Dashboard (one plan with a 15-day trial is enough).
- During the trial every feature and the storefront chart work.
- After the trial, `$app:billing.isActive` becomes `false`, the Liquid snippet renders nothing, and the admin pages lock behind a subscribe screen.
- The Worker refreshes billing hourly so a shop that never opens the app still hides the chart on time. **Refresh status** on the Plan page forces a fresh check.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run worker:dev` | Runs the Worker locally with Wrangler. |
| `npm run worker:deploy` | Deploys only the Worker. |
| `shopify app build` | Validates app configuration and bundles the theme extension. |
| `shopify app deploy` | Deploys app configuration and extensions. |
| `npm run deploy` | Worker deploy followed by `shopify app deploy`. |

`shopify app build` prints an `AssetSizeAppBlockJavaScript` warning for `assets/size-chart.js` (~22 KB raw). Shopify documents this rule as a performance suggestion and does not enforce the 10 KB value; the build still succeeds.

## Security

- Session tokens are verified in the Worker (HMAC-SHA256, audience, expiry, shop host).
- Webhooks are HMAC-verified; the app stores no customer data outside Shopify.
- Offline access tokens live in Workers KV and are never sent to the browser.
- Secrets are set with `wrangler secret put` and are not part of the repository.
