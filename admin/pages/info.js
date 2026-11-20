import { DEFAULT_SETTINGS } from '../lib/sizeChart.js';
import { esc, icon, statusBadge } from '../ui.js';

const SETTINGS_DOCS = [
  ['Button text', 'Settings → Button → Button text', DEFAULT_SETTINGS.buttonText, 'Label on the Size guide button when the theme block does not set its own.'],
  ['Floating position', 'Settings → Button → Floating button position', DEFAULT_SETTINGS.buttonPosition, 'Bottom-left or bottom-right placement for the floating app embed.'],
  ['Button colour', 'Settings → Button → Button colour', DEFAULT_SETTINGS.primaryColor, 'Background colour of the button and chart accents.'],
  ['Corner radius', 'Settings → Button → Corner radius', DEFAULT_SETTINGS.borderRadius, 'Border radius for buttons and the chart window.'],
  ['Display mode', 'Settings → Chart window → Display mode', DEFAULT_SETTINGS.displayMode, 'Modal, side drawer, inline, accordion, or a text link next to the variant picker.'],
  ['Default unit', 'Settings → Chart window → Default unit', DEFAULT_SETTINGS.defaultUnit, 'Starting unit on the storefront. Customers can switch cm ↔ inches.'],
  ['Default size system', 'Settings → Chart window → Default size system', DEFAULT_SETTINGS.defaultSizeSystem, 'Starting size system when the chart has a matching column.'],
  ['Find my size', 'Settings → Chart window → Find my size', 'On', 'Show the calculator when the chart has measurement columns.'],
  ['Fit feedback', 'Settings → Chart window → Fit feedback', 'On', 'Asks shoppers whether the chart runs small, true to size or large; totals appear on the Dashboard.'],
  ['Theme block text', 'Theme editor → Size Chart block', 'Size Guide', 'Overrides Button text for that block.'],
  ['Theme block mode', 'Theme editor → Size Chart block', 'Modal', 'Overrides Display mode for that block.'],
  ['Theme block unit', 'Theme editor → Size Chart block', 'cm', 'Overrides Default unit for that block.'],
  ['Theme block colour', 'Theme editor → Size Chart block', '#000000', 'Overrides Button colour for that block.'],
  ['Theme block radius', 'Theme editor → Size Chart block', '4px', 'Overrides Corner radius for that block.'],
  ['Float position', 'Theme editor → App embeds → Size Chart Float', 'Bottom right', 'Overrides Floating position for the embed.'],
  ['Collection & cart links', 'Theme editor → App embeds → Size Chart Links', 'On on collection pages and in the cart', 'Adds a Size guide text link under product titles on collection cards and next to each cart line item.'],
  ['Product page override block', 'Shopify admin → product page → Add block → Apps → Size chart', 'Optional', 'Sets or clears the per-product chart override without opening the app. Updates the same data as Assignment.'],
];

const PAGES = [
  ['Dashboard', '/', 'Status, quick start and recent charts.'],
  ['Size charts', '/charts', 'Templates, chart list, create, duplicate and delete.'],
  ['Chart editor', '/charts/:id', 'Tables, units, size systems, fit notes and measuring guidance.'],
  ['Assignment', '/assign', 'Rule builder and product overrides.'],
  ['Settings', '/settings', 'Store-wide button and chart defaults.'],
  ['Plan', '/plans', 'Trial, subscription status and Shopify billing.'],
  ['Help', '/help', 'Theme setup steps, assignment behaviour and troubleshooting.'],
  ['App info', '/info', 'This inventory of pages, settings and data.'],
];

export async function render(ctx) {
  const billing = ctx.state.billing;

  return {
    heading: 'App info',
    html: `
      <div class="row-between mb-16">
        <p class="page-intro mt-0">What this app does, every option it exposes, and where your data lives.</p>
        ${statusBadge(billing)}
      </div>

      <div class="stack">
        <s-section>
          <h2 class="panel-title mb-8">App summary</h2>
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-icon">${icon('info')}</div>
              <div><div class="stat-value" style="font-size:16px">Advanced Size Chart</div><div class="stat-label">Version 1.0 · Admin API 2026-10</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">${icon('store')}</div>
              <div><div class="stat-value" style="font-size:16px">Theme app extension</div><div class="stat-label">App block, floating and links embeds</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">${icon('settings')}</div>
              <div><div class="stat-value" style="font-size:16px">Admin UI extension</div><div class="stat-label">Size chart block on product pages</div></div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">${icon('lock')}</div>
              <div><div class="stat-value" style="font-size:16px">No customer data</div><div class="stat-label">Charts, settings and anonymous fit votes</div></div>
            </div>
          </div>
          <p class="muted small mt-16">Size charts are stored as app-owned metaobjects. Assignment rules, settings, a storefront chart index and the billing status are stored as app-owned shop metafields. The theme reads them; the app writes them. No third-party server stores customer information. The widget's own labels follow the storefront language (English, French, German, Spanish, Italian, Japanese, Simplified Chinese, Brazilian Portuguese).</p>
        </s-section>

        <s-section>
          <h2 class="panel-title mb-8">Pages</h2>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr><th>Page</th><th>Path</th><th>Purpose</th></tr></thead>
              <tbody>
                ${PAGES.map(([name, path, purpose]) => `<tr><td class="strong">${esc(name)}</td><td class="mono">${esc(path)}</td><td>${esc(purpose)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </s-section>

        <s-section>
          <h2 class="panel-title mb-8">Every setting</h2>
          <p class="muted small mt-0">App settings are the defaults. Theme block and app embed settings override them for that placement.</p>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr><th>Option</th><th>Where</th><th>Default</th><th>Effect</th></tr></thead>
              <tbody>
                ${SETTINGS_DOCS.map(([name, where, fallback, effect]) => `<tr><td class="strong">${esc(name)}</td><td>${esc(where)}</td><td class="mono">${esc(fallback)}</td><td>${esc(effect)}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </s-section>

        <s-section>
          <h2 class="panel-title mb-8">Chart fields</h2>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr><th>Field</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td class="strong">Name</td><td>Chart title and the label used in assignment rules.</td></tr>
                <tr><td class="strong">Default unit</td><td>Base unit for the chart (cm, in or mm). Storefront converts cm ↔ inches.</td></tr>
                <tr><td class="strong">Size systems</td><td>Which size-system switch options appear (US, EU, UK…).</td></tr>
                <tr><td class="strong">Tables</td><td>Columns, rows and per-column units. Multiple tables become tabs.</td></tr>
                <tr><td class="strong">Fit notes</td><td>Advice shown under the table.</td></tr>
                <tr><td class="strong">How to measure</td><td>Instructions shown above Find my size.</td></tr>
                <tr><td class="strong">Measuring image</td><td>Optional image URL shown with the instructions.</td></tr>
              </tbody>
            </table>
          </div>
        </s-section>

        <s-section>
          <h2 class="panel-title mb-8">Plan and access</h2>
          <p class="muted small">New installs receive a 15-day free trial. During the trial all features and the storefront chart are enabled. If no subscription is active after the trial, the storefront chart is hidden and these pages lock until a plan is chosen. Subscription status is checked through Shopify's Partner API and mirrored to the storefront hourly and whenever the app is opened.</p>
          <div class="row mt-8">
            <a class="btn" href="/plans" data-link>View plan status</a>
            <a class="btn" href="/help" data-link>Setup help</a>
          </div>
        </s-section>
      </div>
    `,
  };
}
