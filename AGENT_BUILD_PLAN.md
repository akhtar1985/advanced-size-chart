# AI Agent Build Plan: Advanced Size Chart App (Shopify, serverless)

Give this whole file to your coding agent. It must complete ONE phase at a time, run the checks, and stop for human approval before the next phase.

## Ground rules for the agent

1. Read the current Shopify docs before writing code in each phase (links at the bottom). Do not rely on memory for CLI flags, TOML syntax, or API versions. If a doc contradicts this plan, follow the doc and note it.
2. No database and no long-running server. Allowed: theme app extension, app-owned metafields/metaobjects, a static-hosted App Home, and tiny edge functions (Cloudflare Worker) only where marked.
3. Never store secrets in metafields or client code.
4. Commit after every step. Write a short CHANGELOG entry per phase.
5. After each phase, report: what was built, how it was tested, what is unverified.

## Phase 0: Setup

1. Confirm Node (LTS) and Shopify CLI are installed and up to date.
2. Create a Shopify dev store (`shopify store create dev`, or via Dev Dashboard).
3. Scaffold the app with Shopify CLI (`shopify app init`) using the extension-only template. Name: `size-chart-pro` (change later).
4. Run `shopify app dev`, select the dev store, confirm the app installs.
5. Install two test themes on the dev store: Dawn and one other Online Store 2.0 theme. Add 10 sample products (clothing, shoes) in 3 collections with tags and vendors.

Done when: the app installs on the dev store and `shopify app dev` runs without errors.

## Phase 1: Data model (declarative, in shopify.app.toml)

1. Read: declarative custom data definitions doc.
2. Declare an app-owned metaobject `size_chart` with fields: name (text), category (text: men/women/kids/shoes), default_unit (text: cm or in), size_systems (list of text, e.g. EU, UK, US, IN), tables (JSON), measure_image (file reference), measure_instructions (rich text), fit_notes (text).
3. Declare an app-owned product metafield `size_chart` (metaobject reference) for per-product override.
4. Declare app-owned shop metafields: `rules` (JSON, ordered list of rules) and `settings` (JSON).
5. Define the JSON shapes in `docs/schema.md`, including a predefined `category` field and seed templates for common categories (Men, Women, Kids, Shoes):
   - tables: `[{ "name": "Men", "columns": ["Size","Chest","Waist"], "rows": [["S", 91.4, 76.2]], "units": {"Chest":"cm","Waist":"cm"}, "sizeSystemColumns": {"EU":"...", "UK":"..."} }]`. Store measurements in one base unit (cm).
   - rules: `[{ "id": "r1", "priority": 1, "match": {"type":"collection|vendor|product_type|tag|all", "value":"..."}, "chartId": "gid://..." }]`
6. Run `shopify app dev` and verify definitions appear in the dev store. Then `shopify app deploy` to a test version.

Why one rules JSON: Liquid loops over metaobject lists return only the first 50 entries and a page can access only 50 metaobject definitions.

Done when: you can manually create a size_chart entry in Shopify admin and assign it to a product.

## Phase 2: Storefront theme app extension (MVP display)

1. Generate a theme app extension (`shopify app generate extension`).
2. Create an **app block** `size-chart` for the product page and an **app embed** `size-chart-floating` for the floating button.
3. Liquid resolver (keep Liquid under the documented size limit; put logic in JS):
   - Priority: product metafield override first, then rules in order (collection, vendor, product type, tag, all).
   - Read values via the `$app` prefix, for example `product.metafields["$app:size_chart"]`.
   - Output the resolved chart as JSON in a `<script type="application/json">` tag.
4. JS asset (vanilla JS, no framework): renders the chart from that JSON. Features:
   - Display modes: modal, side drawer, inline, accordion.
   - Unit toggle cm/in, remembered in localStorage (wrapped in try/catch).
   - Size-system selector (EU/UK/US/IN).
   - Highlight row matching the selected variant (read variant option from the theme's variant change event / form).
   - Tabs for multiple tables.
5. Block settings in the theme editor: button text, position, colors, font, border radius, default unit, display mode. Respect the documented limit on settings per block; if exceeded, move extras to the settings metafield.
6. Accessibility: focus trap, ESC to close, aria roles, keyboard-navigable table, real `<table>` markup.
7. Responsive CSS; horizontal scroll for wide tables on mobile.

Done when: on Dawn and the second theme, a product with a chart shows the button, opens the modal, toggles units, and works on a mobile viewport. A product with no chart shows nothing.

## Phase 3: Admin editor (static App Home)

1. Read: App Home docs (iframe vs UI extension) and the Direct API access docs.
2. Decision gate: ask the human whether this is custom distribution (use the Shopify-hosted App Home UI extension, Preact, 64 KB bundle limit) or public App Store (use a static iframe app on Cloudflare Pages). Default to the static iframe app.
3. Enable Direct API access in `shopify.app.toml` (`[access.admin] embedded_app_direct_api_access = true`, choose online or offline mode per the docs) and set the required scopes (likely read_products and write_products plus metaobject scopes; confirm in docs).
4. Build the admin UI with Polaris web components and App Bridge:
   - Chart list (search, duplicate, delete).
   - Chart editor: table grid editor, add/remove rows and columns, unit per column, size-system columns, measure image upload, instructions.
   - CSV import and CSV/JSON export of all charts (export is a known merchant complaint).
   - Rule manager: add, reorder, delete rules; product picker for overrides.
   - Settings page: defaults, display mode, branding.
   - All reads/writes go through `fetch('shopify:admin/api/<version>/graphql.json')` using metaobject and metafield mutations.
5. Add an onboarding step that creates a sample chart and links to the theme editor to enable the app block/embed.

Done when: a merchant can create a chart in the app, assign it by rule, and see it on the storefront without touching Shopify admin metaobject pages.

## Phase 4: Find my size and Markets

1. Add a "Find my size" form to the modal: inputs for height, weight, chest, waist, hips (configurable per chart), fit preference (snug / regular / loose).
2. Algorithm in the browser: convert inputs to cm, compute distance to each row range or midpoint, apply fit offset, return the nearest size and the next size up as a fallback. Unit-test this function.
3. Markets: read the active market/country in Liquid (`localization`) and choose default unit and size system per market from settings.
4. Emit `window.dataLayer` events (chart_opened, size_selected, size_calculator_used) so merchants can connect GA4 themselves.

Done when: unit tests pass and the flow works on mobile.

## Phase 5: Billing and compliance (the only edge function work)

1. Read: Shopify App Pricing docs and the current App Store requirements for compliance/privacy webhooks.
2. Create plans in the Partner Dashboard (not in code): Free (3 charts, small branding link) and Pro $9.99/month with a 15-day trial. Do not call the Billing API.
3. Create one Cloudflare Worker that: receives the mandatory compliance webhooks and verifies the HMAC signature, and optionally checks `activeSubscription` through the Partner API (credential stored as a Worker secret, never in client code).
4. Feature gating: all app features are active during the 15-day trial. After the trial, non-subscribers keep the free tier (3 charts, basic display, branding link) while pro features (rules, calculator, unlimited charts, branding removal) are disabled. Gate in the admin UI and storefront flags. Be aware client-side gating is not tamper-proof; accept this or route through the Worker.
5. Test with the private test plan and a dev store.

Done when: install, plan selection, upgrade, downgrade and uninstall all behave correctly on a dev store.

## Phase 6: QA, performance, launch

1. Test on Dawn plus at least 3 other popular themes, desktop and mobile, with long tables.
2. Performance: lazy-load the JS and chart JSON, no layout shift, small asset size.
3. Edge cases: product with chart in multiple collections (priority works), deleted chart, empty table, huge table, RTL language.
4. Run `shopify app deploy`, then prepare the App Store listing: 5 screenshots, a short video tutorial, privacy policy, support email, free migration offer.
5. Submit for review; fix feedback.

## Docs the agent must read

- https://shopify.dev/docs/apps/build/online-store/theme-app-extensions
- https://shopify.dev/docs/apps/build/custom-data/declarative-custom-data-definitions
- https://shopify.dev/docs/apps/build/security/storefront/store-settings-in-app-owned-metafields
- https://shopify.dev/docs/apps/build/metafields/metafield-limits
- https://shopify.dev/docs/apps/build/metaobjects/metaobject-limits
- https://shopify.dev/docs/apps/build/app-home
- https://shopify.dev/docs/api/app-home/latest/apis/authentication-and-data/resource-fetching-api
- https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing
- https://shopify.dev/docs/storefronts/themes/architecture/limits
