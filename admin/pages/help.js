import { themeEditorUrl, getStoreHandle } from '../lib/billing.js';
import { esc, icon } from '../ui.js';

export async function render() {
  const store = getStoreHandle();

  return {
    heading: 'Help',
    html: `
      <div class="page-intro">Everything needed to get a size guide onto your product pages, plus fixes for the usual setup problems.</div>

      <div class="columns">
        <div class="stack">
          <s-section>
            <h2 class="panel-title">Part 1 — Set up the chart in the app</h2>
            <ol class="steps mt-8">
              <li>
                <h4>Pick a product category</h4>
                <p>Open <a class="link" href="/charts" data-link>Size charts</a> and choose a category — T-shirt, dress shirt, women's top, jeans, skirt, shorts, dress, jacket, shoes, socks, belt, gloves, hat, ring, watch, glasses or sunglasses. The chart is created with sizes and measurements already filled in. You can also create a blank chart from <strong>New size chart</strong>.</p>
              </li>
              <li>
                <h4>Assign it to products</h4>
                <p>Right after creating the chart you can click <strong>Show it on all products</strong>. For narrower targeting, open <a class="link" href="/assign" data-link>Assignment</a> and add a rule such as “Products in collection Summer → Women's Top”, or override a single product.</p>
              </li>
              <li>
                <h4>Add the button to your theme</h4>
                <p>Use one of the two theme methods below. The app block puts a button where you choose; the app embed adds a floating button to every product page.</p>
              </li>
            </ol>
          </s-section>

          <s-section>
            <h2 class="panel-title">Part 2 — Method A: Size guide button in the product page</h2>
            <p class="muted small mt-0">Best control over placement — usually directly under Add to cart.</p>
            <ol class="steps mt-8">
              <li>
                <h4>Open the product template</h4>
                <p>In Shopify admin go to <strong>Online Store → Themes → Customize</strong>, then choose <strong>Products → Default product</strong> in the template dropdown at the top.</p>
              </li>
              <li>
                <h4>Add the app block</h4>
                <p>In the left sidebar scroll to <strong>Product information</strong> (or the main product section) and click <strong>Add block</strong>. Open the <strong>Apps</strong> group and select <strong>Size Chart</strong>.</p>
              </li>
              <li>
                <h4>Place and save</h4>
                <p>Drag the block under the quantity or buy buttons. Set the button text and colour if you want to override the app defaults, then click <strong>Save</strong>.</p>
                <p class="muted small">To show a text link instead of a button under the variant picker, set <strong>Display mode</strong> to <strong>Text link next to the variant picker</strong> in the block or in app Settings.</p>
              </li>
            </ol>
            <div class="row mt-8">
              <a class="btn" href="${esc(themeEditorUrl('block'))}" target="_top">${icon('external', 15)} Open theme editor</a>
            </div>
          </s-section>

          <s-section>
            <h2 class="panel-title">Part 2 — Method B: Floating size guide button</h2>
            <p class="muted small mt-0">One switch adds a small floating button to all product pages.</p>
            <ol class="steps mt-8">
              <li>
                <h4>Open App embeds</h4>
                <p>In the theme editor, click the <strong>App embeds</strong> icon in the left sidebar (the puzzle-piece style icon at the bottom).</p>
              </li>
              <li>
                <h4>Turn on Size Chart Float</h4>
                <p>Enable <strong>Size Chart Float</strong>. Set its position (bottom left or right), button text and colour.</p>
              </li>
              <li>
                <h4>Save the theme</h4>
                <p>Click <strong>Save</strong>. The button now appears on product pages that have a chart assigned.</p>
              </li>
            </ol>
            <div class="callout callout-warning mt-8">
              <strong>Use one method, not both</strong>
              <p>If you enable the app block and the app embed together, customers see two size buttons. Pick the one that fits your theme.</p>
            </div>
            <div class="row mt-8">
              <a class="btn" href="${esc(themeEditorUrl('embeds'))}" target="_top">${icon('external', 15)} Open app embeds</a>
            </div>
          </s-section>

          <s-section>
            <h2 class="panel-title">Part 2 — Method C: Size guide links on collection pages and in the cart</h2>
            <p class="muted small mt-0">Optional. Adds a small Size guide text link under product titles on collection cards and under each cart line item. It does not add a button to the product page, so it can be used together with Method A or B.</p>
            <ol class="steps mt-8">
              <li>
                <h4>Open App embeds</h4>
                <p>Theme editor → <strong>App embeds</strong> (left sidebar).</p>
              </li>
              <li>
                <h4>Turn on Size Chart Links</h4>
                <p>Enable <strong>Size Chart Links</strong> and choose whether it appears on collection pages, in the cart, or both. The link text defaults to your Settings → Button text.</p>
              </li>
              <li>
                <h4>Save the theme</h4>
                <p>Click <strong>Save</strong>. Links appear only for products that have a chart assigned, for the first 20 products or line items on the page.</p>
              </li>
            </ol>
            <p class="hint mt-8">Cart drawers that update without a page reload may not show the link until the page is reloaded. The standard cart page is supported.</p>
            <div class="row mt-8">
              <a class="btn" href="${esc(themeEditorUrl('embeds'))}" target="_top">${icon('external', 15)} Open app embeds</a>
            </div>
          </s-section>

          <s-section>
            <h2 class="panel-title">How assignment decides the chart</h2>
            <ol class="steps mt-8">
              <li>
                <h4>Product override first</h4>
                <p>If the exact product has an override in <a class="link" href="/assign" data-link>Assignment</a>, that chart is used — no other rule is checked.</p>
              </li>
              <li>
                <h4>Then rules, top to bottom</h4>
                <p>The first matching rule wins. Put narrow rules (a collection, a vendor) above broad ones (All products).</p>
              </li>
              <li>
                <h4>No match means no button</h4>
                <p>If nothing matches, the theme block or floating button stays hidden on that product.</p>
              </li>
            </ol>
          </s-section>

          <s-section>
            <h2 class="panel-title">Edit a product override from the product page</h2>
            <p class="muted small mt-0">The app includes a Shopify admin block, so you can pin a chart to one product without opening the app.</p>
            <ol class="steps mt-8">
              <li>
                <h4>Open the product in Shopify admin</h4>
                <p>Go to <strong>Products</strong> and open the product. Scroll to the <strong>Size chart</strong> block. If it is not shown, click <strong>Add block</strong>, open the <strong>Apps</strong> group and select <strong>Size chart</strong>, then pin it.</p>
              </li>
              <li>
                <h4>Pick a chart or clear the override</h4>
                <p>Choose a chart to use it for this product only, or choose <strong>No override — use assignment rules</strong> to fall back to <a class="link" href="/assign" data-link>Assignment</a>. Save.</p>
              </li>
            </ol>
            <p class="hint mt-8">The block writes the same override as the Assignment page, so both always show the same result. It is read-only when the trial has ended.</p>
          </s-section>

          <s-section>
            <h2 class="panel-title">Find my size</h2>
            <p class="muted small mt-0">Customers enter their measurements and the app points at the closest size.</p>
            <ul class="muted small">
              <li>The calculator appears when the assigned chart has at least one measurement column (Chest, Waist, Foot Length…).</li>
              <li>Columns named <span class="kbd">Size</span>, <span class="kbd">US</span>, <span class="kbd">EU</span>, <span class="kbd">UK</span>, <span class="kbd">IN</span>, <span class="kbd">AU</span>, <span class="kbd">JP</span>, <span class="kbd">IT</span> and <span class="kbd">FR</span> are treated as size labels.</li>
              <li>Ranges such as <span class="kbd">86-91</span> work — the app checks whether the measurement falls inside the range.</li>
              <li>Turn it off in <a class="link" href="/settings" data-link>Settings</a> if you only want the table.</li>
            </ul>
          </s-section>

          <s-section>
            <h2 class="panel-title">Units and Markets</h2>
            <p class="muted small">Measurements are stored in each chart's base unit. On the storefront, cm columns convert to inches when the customer switches units, or automatically for US markets. Size labels never change. Charts saved in millimetres keep millimetre columns as-is.</p>
          </s-section>

          <s-section>
            <h2 class="panel-title">Storefront language</h2>
            <p class="muted small">The size guide window follows the language the shopper is browsing in. Built-in labels — the button, Find my size, fit feedback, hints — are translated into English, French, German, Spanish, Italian, Japanese, Simplified Chinese and Brazilian Portuguese, and fall back to English for other languages. Chart names, table headings, fit notes and measuring instructions come from the chart's own per-language content. A custom button text is always shown as written.</p>
          </s-section>

          <s-section>
            <h2 class="panel-title">Troubleshooting</h2>
            <div class="stack-sm">
              <div class="card-flat">
                <div class="strong">No Size guide button on a product page</div>
                <p class="muted small mt-0">Check, in order: (1) the product matches a rule or override; (2) the theme has the Size Chart block on the product template or the Size Chart Float embed enabled; (3) you clicked Save in the theme editor; (4) the trial has not ended — see <a class="link" href="/plans" data-link>Plan</a>.</p>
              </div>
              <div class="card-flat">
                <div class="strong">Two buttons appear</div>
                <p class="muted small mt-0">The app block and the floating app embed are both on. Turn one off in the theme editor.</p>
              </div>
              <div class="card-flat">
                <div class="strong">The Size chart block is missing on a product page</div>
                <p class="muted small mt-0">Click <strong>Add block</strong> on the product page, open the <strong>Apps</strong> group and add <strong>Size chart</strong>. If it is not listed, run <span class="mono">shopify app deploy</span> so the admin extension is released to the store.</p>
              </div>
              <div class="card-flat">
                <div class="strong">No Size guide link on collection cards or in the cart</div>
                <p class="muted small mt-0">Check, in order: (1) the product has a chart assigned; (2) the Size Chart Links embed is enabled and saved in the theme editor; (3) the collection or cart shows a product from the first 20 items.</p>
              </div>
              <div class="card-flat">
                <div class="strong">The wrong chart appears</div>
                <p class="muted small mt-0">A product override beats every rule; otherwise the first matching rule wins. Reorder rules in <a class="link" href="/assign" data-link>Assignment</a>.</p>
              </div>
              <div class="card-flat">
                <div class="strong">Edits are not on the storefront yet</div>
                <p class="muted small mt-0">Saving a chart publishes it immediately. If you just subscribed after a trial ended, allow up to one hour for the storefront to unlock, then reload the product page.</p>
              </div>
              <div class="card-flat">
                <div class="strong">The chart opened but the table is empty</div>
                <p class="muted small mt-0">Open the chart in <a class="link" href="/charts" data-link>Size charts</a> and check the table has rows and a Size column. Import CSV again if needed.</p>
              </div>
              <div class="card-flat">
                <div class="strong">Buttons say “Size guide” but I renamed it</div>
                <p class="muted small mt-0">The theme block or app embed has its own button text field. Clear it, or set the same text there, to use <a class="link" href="/settings" data-link>Settings</a> instead.</p>
              </div>
            </div>
          </s-section>
        </div>

        <aside class="rail">
          <div class="card">
            <h3>Quick links</h3>
            <ul>
              <li><a class="link" href="/charts" data-link>Size charts</a></li>
              <li><a class="link" href="/assign" data-link>Assignment</a></li>
              <li><a class="link" href="/settings" data-link>Settings</a></li>
              <li><a class="link" href="/plans" data-link>Plan and trial</a></li>
            </ul>
          </div>
          <div class="card">
            <h3>Shopify paths</h3>
            <p class="small muted mt-0">
              Theme editor:<br />
              <span class="mono">Online Store → Themes → Customize</span>
            </p>
            <p class="small muted mt-0">
              Theme list:<br />
              <span class="mono">Online Store → Themes</span>
            </p>
            ${store ? `<p class="small muted mt-0">Store: <span class="mono">${esc(store)}</span></p>` : ''}
          </div>
          <div class="card">
            <h3>Still stuck?</h3>
            <p class="small muted mt-0">Use <a class="link" href="/info" data-link>App info</a> to see every page and setting in one place, and contact support with your store domain and the product URL.</p>
          </div>
        </aside>
      </div>
    `,
  };
}
