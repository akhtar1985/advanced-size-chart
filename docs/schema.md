# Data Schema

## `tables` field (JSON, stored on `size_chart` metaobject)

```json
[
  {
    "name": "Men",
    "columns": ["Size", "Chest", "Waist"],
    "rows": [["S", 91.4, 76.2], ["M", 96.5, 81.3]],
    "units": { "Chest": "cm", "Waist": "cm" },
    "sizeSystemColumns": { "EU": "Size", "UK": "Size" }
  }
]
```

All measurements stored in **cm** (base unit). The JS layer converts to inches on display.

## `rules` field (JSON, stored on shop metafield `$app:rules`)

```json
[
  {
    "id": "r1",
    "priority": 1,
    "match": { "type": "collection", "value": "gid://shopify/Collection/123" },
    "chartId": "gid://shopify/Metaobject/456"
  },
  {
    "id": "r2",
    "priority": 2,
    "match": { "type": "vendor", "value": "Nike" },
    "chartId": "gid://shopify/Metaobject/789"
  },
  {
    "id": "r3",
    "priority": 3,
    "match": { "type": "all", "value": "" },
    "chartId": "gid://shopify/Metaobject/000"
  }
]
```

Match types: `collection` | `vendor` | `product_type` | `tag` | `all`

## Predefined size categories

Seed templates for common categories: `men`, `women`, `kids`, `shoes`. Each template pre-populates the `tables` field with standard columns and rows in cm.

## `settings` field (JSON, stored on shop metafield `$app:settings`)

```json
{
  "displayMode": "modal",
  "defaultUnit": "cm",
  "defaultSizeSystem": "US",
  "buttonText": "Size Guide",
  "buttonPosition": "below-atc",
  "borderRadius": "8px",
  "primaryColor": "#000000",
  "showCalculator": true
}
```
