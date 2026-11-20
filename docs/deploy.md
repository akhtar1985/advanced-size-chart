# Deploy Advanced Size Chart

This guide takes a fresh checkout to a working public app on a development store. Everything runs on one Cloudflare Worker plus Shopify; no separate API or database is needed.

Do not paste secrets, storefront passwords or card details into chat, tickets or commits. Enter each secret yourself in the Wrangler prompt described below.

## 1. Shopify app record

1. In the Partner Dashboard, create a **Public** app (Apps → Create app → Public distribution).
2. Note two ids from the browser URL, `https://partners.shopify.com/<ORG_ID>/apps/<APP_ID>`:
   - `<ORG_ID>` → `SHOPIFY_PARTNER_ORG_ID`
   - `<APP_ID>` → `SHOPIFY_PARTNER_APP_ID`

   Use the **Partner Dashboard** URL number here. The Dev Dashboard URL (`dev.shopify.com/dashboard/<id>/apps/...`) shows the organization id instead, and the Partner API rejects it with a 401.
3. Copy the app's **Client ID** → `SHOPIFY_API_KEY`.
4. The **Client secret** is only needed in step 3 below; keep it out of the repository.

`shopify.app.toml` in this repository already declares the app handle, scopes, webhooks, metaobject and metafield definitions, so `shopify app deploy` configures the app URLs and data model.

App handles are globally unique and become both the admin URL (`admin.shopify.com/store/<store>/apps/<handle>`) and the App Store slug. The handle here is `advanced-size-chart-asc` because the shorter slug was already owned by another app. If you later free the `advanced-size-chart` handle (for example by deleting an earlier app record in the Dev Dashboard), change the `handle` line and deploy again; existing installs stay installed, but bookmarked admin URLs using the old slug stop working.

The scopes include `write_app_proxy`, which Shopify requires for the `[app_proxy]` entry that routes `POST /apps/size-chart/feedback` to the Worker. Deploying a version with a new scope makes existing installs approve it: open the app from the Shopify admin (or reinstall on a development store) and confirm the permission prompt. Storefront charts keep working while approval is pending; only the fit-feedback proxy call fails until the scope is granted.

## 2. Cloudflare Worker

```shell
npx wrangler login
npx wrangler kv namespace create SHOPS
```

Paste the returned namespace id into `wrangler.toml` (`[[kv_namespaces]] id`).

Fill the `[vars]` block in `wrangler.toml`:

```toml
SHOPIFY_API_KEY = "<client id>"
APP_HANDLE = "advanced-size-chart-asc"
SHOPIFY_PARTNER_ORG_ID = "<org id>"
SHOPIFY_PARTNER_APP_ID = "<app id>"
```

Deploy once to learn the Worker URL:

```shell
npx wrangler deploy
```

The URL is printed at the end, for example `https://advanced-size-chart.<account>.workers.dev`.

## 3. Secrets

Run each command and type the value at the prompt. Nothing is written to disk.

```shell
npx wrangler secret put SHOPIFY_API_SECRET
npx wrangler secret put SHOPIFY_PARTNER_API_TOKEN
```

- `SHOPIFY_API_SECRET` — the app's client secret from the Partner Dashboard.
- `SHOPIFY_PARTNER_API_TOKEN` — a Partner API token with the **Manage apps** permission. Create it under the organization's Partner API clients page. This is what lets the Worker read `activeSubscription` for each shop.

## 4. Point Shopify at the Worker

Replace the placeholder host in four places:

- `wrangler.toml` → `APP_HANDLE` (already correct unless you renamed the app)
- `shopify.app.toml` → `application_url`
- `shopify.app.toml` → `auth.redirect_urls` and the webhook `uri`
- `shopify.app.toml` → `app_proxy.url` (storefront fit-feedback votes land on `/apps/size-chart/feedback`)

Example for `https://advanced-size-chart.my-account.workers.dev`:

```toml
application_url = "https://advanced-size-chart.my-account.workers.dev"

[auth]
redirect_urls = [ "https://advanced-size-chart.my-account.workers.dev/auth/callback" ]

[app_proxy]
url = "https://advanced-size-chart.my-account.workers.dev/proxy"

[[webhooks.subscriptions]]
uri = "https://advanced-size-chart.my-account.workers.dev/webhooks"
```

Then deploy the configuration and the theme extension:

```shell
npx wrangler deploy
shopify app deploy
```

`shopify app build` runs first as part of deploy. It prints an `AssetSizeAppBlockJavaScript` suggestion for `size-chart.js` (~22 KB raw against a 10 KB suggestion). Shopify does not enforce this value and the build succeeds.

## 5. Plans

Plans use **Shopify App Pricing** (formerly Managed Pricing). In the Partner Dashboard open **App distribution → your app → Distribution → Manage submission → Pricing details → Manage**:

1. Add one subscription plan (for example "$9.99 / month").
2. Set the trial to **15 days**.
3. Confirm the Pricing settings show **Shopify App Pricing enabled**.

The app ships with one public plan, `all-in-one` at $10/month with a 15-day trial, plus a private `shopify-test` plan. Development stores in the same organization can select paid plans at no charge, which is how the trial and billing gate are tested.

The Worker reads subscription state with the Partner API every ten minutes at most, and the cron refreshes every shop hourly. Until a merchant selects a plan, the install date plus 15 days is used as the trial window, so a fresh install is never locked early.

## 6. Install and verify

1. Install the app on a development store (Partner Dashboard → your app → **Test on development store**, or the installation link).
2. The app opens inside the admin. On first load the Worker exchanges the App Bridge session token for an offline token and stores it in KV.
3. Open **Plan**. It should show "Free trial — 15 days left" (or the plan status).
4. The Worker writes the shop metafield `$app:billing` (used by the storefront snippet) on every billing check. The Plan page shows the same status the storefront receives.
5. Create a chart, assign it, and add the theme block (next section).

If the app shows "Open this app from your Shopify admin so it can sign in", the session token could not be verified: confirm the client id and secret match the app, then reinstall.

## 7. Theme setup

**Option A — product block**

1. Online Store → Themes → **Customize** the published theme.
2. Open a **Product** template.
3. **Add block → Apps → Size Chart**, place it near the buy buttons, **Save**.

**Option B — floating button**

1. Theme editor → **App embeds** (left sidebar).
2. Enable **Size Chart Float**, choose the side, **Save**.

Use one product-page option per product template. Enabling both shows two buttons.

**Admin product block (optional)**

`shopify app deploy` also releases the admin UI extension `extensions/product-size-chart`. To use it, open a product in the Shopify admin, click **Add block**, open the **Apps** group and add **Size chart**. The block shows the current override and lets you set or clear it without opening the app; it writes the same data as the Assignment page. It appears read-only when the trial has ended.

**Option C — collection and cart links (optional)**

1. Theme editor → **App embeds** (left sidebar).
2. Enable **Size Chart Links**, choose collection pages and/or the cart, set the link text, **Save**.

The embed adds a Size guide text link under product titles on collection cards and under each cart line item, for products that have a chart assigned. It covers the first 20 products or line items on the page and can run alongside Option A or B. Cart drawers that re-render without a page load may lose the link until the page reloads.

The block and embeds render nothing when no chart is assigned, when the app is outside the trial/subscription, or in the theme editor without data (the editor shows a short note instead).

## 8. Preview locally (optional)

`shopify app dev` can serve the Worker through a Cloudflare tunnel, so the admin preview loads the same app that deploys later.

1. Run `shopify app env pull` once. It writes `.env` (gitignored) with `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`, and `wrangler dev` loads that file as local vars when `.dev.vars` is absent. Treat `.env` as a credential file. Alternatively, put `SHOPIFY_API_SECRET` in `.dev.vars` yourself.
   Without the secret, session-token checks return 401 and the app shows the sign-in notice. Billing checks stay off in local dev unless you also add `SHOPIFY_PARTNER_API_TOKEN`, `SHOPIFY_PARTNER_ORG_ID` and `SHOPIFY_PARTNER_APP_ID`.
2. Run `shopify app dev`. `web/shopify.web.toml` starts `wrangler dev` on port 8787, opens the tunnel, and `automatically_update_urls_on_dev` points the app at the tunnel (`shopify app info` shows **Update URLs: Yes**).
3. Open the app from the store admin and reload after the tunnel URL changes.

The CLI does not restore the previous URLs when the session ends; the next `shopify app deploy` with the deployed Worker URL overwrites them.

## 9. Custom domain (optional)

Add a route or custom domain to the Worker in Cloudflare, then update `application_url`, `auth.redirect_urls`, the webhook `uri` and the `redirect_uri` used by Shopify to the custom domain, and redeploy both the Worker and `shopify app deploy`.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| App iframe shows "Unauthorized" | Open it from Apps in the Shopify admin. Verify `SHOPIFY_API_SECRET` equals the client secret, then reinstall. |
| Chart missing on the storefront | Is a chart assigned (Assignment page)? Is `$app:billing.isActive` true? Is the theme block or embed added to the published theme? |
| Two buttons appear | Both the block and the float embed are enabled; disable one. |
| No link on collection cards or in the cart | Is the product assigned to a chart? Is the Size Chart Links embed enabled and saved? Only the first 20 products/line items get a link. |
| Size chart block is missing on a product page | Click Add block → Apps → Size chart on the product page. If it is not listed, run `shopify app deploy` to release the admin extension. |
| Values are not converted to inches | The column must have a unit (cm, in or mm) set in the chart editor; columns without a unit are treated as labels. |
| Plan page returns 404 | No plan exists, the app is not public, or `APP_HANDLE` does not match the app handle. |
| Dev preview frame is blank or loads `example.workers.dev` | The app URL still points at an old target. Restart `shopify app dev`, confirm `web/shopify.web.toml` exists, `shopify app info` shows **Update URLs: Yes**, and `.env` or `.dev.vars` has `SHOPIFY_API_SECRET`. Run only one dev session at a time; a second `wrangler dev` fights over port 8787 and leaves the tunnel hanging. |
| Trial shows "Plan checks are not configured" | `SHOPIFY_PARTNER_API_TOKEN`, `SHOPIFY_PARTNER_ORG_ID` or `SHOPIFY_PARTNER_APP_ID` is missing; set them and redeploy. |
| Status stays stale after subscribing | Click **Refresh status** on the Plan page; the cron forces a full refresh every hour. |

## Useful commands

```shell
npx wrangler tail                       # live Worker logs
npx wrangler kv key list --binding SHOPS --remote
npx wrangler secret list
shopify app build
shopify app deploy
```
