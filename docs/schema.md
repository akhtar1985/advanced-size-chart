# Data schema

All data lives in Shopify. There is no external database.

## Chart metaobject — `$app:size_chart`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | single line text | Required; shown as the chart title. |
| `default_unit` | single line text | `cm`, `in` or `mm`. |
| `size_systems` | list of single line text | For example `US`, `EU`, `UK`, `IN`, `AU`, `JP`, `IT`, `FR`. |
| `tables` | JSON | One or more tables, see below. |
| `measure_image` | single line text | Optional image URL shown in the panel. |
| `measure_instructions` | multi line text | Optional measuring tips. |
| `fit_notes` | single line text | Optional note under the table. |
| `translations` | JSON | Optional per-locale overrides, keyed by storefront locale code (`fr`, `pt-BR`). |

### `tables`

```json
[
  {
    "name": "Men",
    "columns": ["Size", "US", "EU", "Chest", "Waist"],
    "units": { "Chest": "cm", "Waist": "cm" },
    "rows": [
      ["S", "34", "44", "86-91", "71-76"],
      ["M", "36", "46", "91-96", "76-81"]
    ]
  }
]
```

- The first column is treated as the size label.
- A cell can be a number, a single value or a range such as `86-91`.
- Only columns listed in `units` are converted between cm, inches and millimetres. Columns without a unit are labels (US, EU, style names).
- `sizeSystemColumns` is derived automatically from `size_systems` and the column names. `US`, `US Waist` and `US-Waist` all map to the `US` system.
- `variant` (optional) maps a table to a shopper-facing variant, e.g. `{ "option": "Fit", "value": "Slim" }`. The matching table opens first.
- `heightWeight` (optional) powers the height/weight finder:

```json
"heightWeight": {
  "heightUnit": "cm",
  "weightUnit": "kg",
  "rows": [
    { "size": "M", "heightMin": "168", "heightMax": "176", "weightMin": "60", "weightMax": "75" }
  ]
}
```

A row needs a `size` plus at least one range (height or weight). The storefront scores each row by distance from the entered values and recommends the closest size; blank bounds become an open-ended range.

## Product override — `product.metafields.app.size_chart`

A `metaobject_reference<$app:size_chart>` on the product. When set, it takes priority over every assignment rule. The Assignment page writes it and also keeps a readable list in the `overrides` shop metafield.

## Shop metafields

### `$app:rules`

```json
[
  {
    "id": "r1",
    "priority": 1,
    "match": {
      "type": "collection",
      "value": "gid://shopify/Collection/123",
      "handle": "trousers",
      "label": "Trousers"
    },
    "chartId": "gid://shopify/Metaobject/456"
  },
  {
    "id": "r2",
    "priority": 2,
    "match": { "type": "vendor", "value": "Nike", "label": "Nike" },
    "chartId": "gid://shopify/Metaobject/789"
  }
]
```

Match types: `collection` | `vendor` | `product_type` | `tag` | `all`. Lower `priority` wins; the storefront snippet sorts by priority, so rule order in the admin is the order applied.

### `$app:charts_index`

A published snapshot of every saved chart, keyed by chart GID:

```json
{
  "gid://shopify/Metaobject/456": {
    "name": "Men's pants",
    "defaultUnit": "cm",
    "sizeSystems": ["US", "EU"],
    "tables": [],
    "fitNotes": "",
    "measureInstructions": "",
    "measureImage": ""
  }
}
```

The snippet resolves the chart id through `rules` or the product override, then reads the chart from this index. The index is rebuilt whenever a chart is saved, duplicated or deleted.

### `$app:settings`

```json
{
  "displayMode": "modal",
  "defaultUnit": "cm",
  "defaultSizeSystem": "US",
  "buttonText": "Size guide",
  "buttonPosition": "bottom-right",
  "borderRadius": "8px",
  "primaryColor": "#111111",
  "showCalculator": true,
  "showFeedback": true
}
```

`displayMode`: `modal` | `drawer` | `inline` | `accordion` | `link`. `link` renders a text link under the theme's variant picker and opens the chart as a modal. `buttonPosition`: `bottom-right` | `bottom-left` (floating embed only). `showFeedback`: shows the "Runs small / True to size / Runs large" bar at the bottom of the guide. Theme block and embed settings override these values.

The snippet passes these values to the renderer as `asc-settings-<uid>`, together with `locale` (`request.locale.iso_code`). `size-chart.js` uses that locale to translate its own labels (button, calculator, fit feedback, hints) into en, fr, de, es, it, ja, zh-CN and pt-BR, falling back to English; chart content uses the chart's per-locale `translations` instead.

### `$app:overrides`

Admin-only list used by the Assignment page:

```json
[
  {
    "productId": "gid://shopify/Product/123",
    "title": "Wide-leg trousers",
    "handle": "wide-leg-trousers",
    "chartId": "gid://shopify/Metaobject/456"
  }
]
```

The product metafield remains the source of truth for the storefront; this list is a convenience index.

### `$app:billing`

Written by the Worker after each billing check:

```json
{
  "status": "trial",
  "isActive": true,
  "trialEndsAt": "2026-12-05T10:00:00.000Z",
  "checkedAt": "2026-11-20T10:00:00.000Z"
}
```

`status`: `trial` | `active` | `none` | `unknown`. The snippet renders nothing only when `isActive` is explicitly `false`, so a missing or unreachable billing check never hides a merchant's chart by accident.

## Fit feedback

The guide posts a vote to `/apps/size-chart/feedback`. Shopify's app proxy (declared in `shopify.app.toml`) forwards it to the Worker route `/proxy/feedback`, which:

1. Validates the `shop` domain, the proxy `signature` and the `timestamp` (one hour window).
2. Accepts only `vote` values `small`, `true` or `large` and a chart id shaped `gid://shopify/Metaobject/<numeric>`.
3. Stores one KV entry per vote: `feedback:<shop>:<chart numeric id>:<timestamp>-<random>` → `{ "vote": "true", "at": "<ISO date>" }`, with a 400-day TTL.

`GET /api/feedback` (session-token protected) reads those keys for the shop and returns per-chart totals to the Dashboard. Votes contain no customer data. Uninstall and `shop/redact` webhooks delete every `feedback:<shop>:` key.
