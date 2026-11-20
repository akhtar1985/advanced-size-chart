import {
  MATCH_LABELS,
  createRuleId,
  saveRules,
  setProductOverride,
  clearProductOverride,
  saveOverrideEntry,
  removeOverrideEntry,
  searchCollections,
  searchProducts,
} from '../lib/sizeChart.js';
import { esc, icon, debounce } from '../ui.js';

export async function render(ctx) {
  const { charts, rules: storedRules, overrides } = ctx.state;
  let rules = storedRules.map((rule) => ({ ...rule, match: { ...rule.match } }));
  let dirty = false;
  let selectedCollection = null;
  let pendingProduct = null;

  const chartById = (id) => charts.find((chart) => chart.id === id);
  const chartName = (id) => chartById(id)?.name || 'Missing chart';

  return {
    heading: 'Assignment',
    html: `
      <div class="row-between mb-16">
        <p class="page-intro mt-0">Decide which chart appears on which products. Product overrides win first, then rules run from top to bottom.</p>
        <div class="row">
          <span class="badge badge-warning hidden" id="rules-dirty">Unsaved rules</span>
          <button class="btn btn-primary" id="save-rules">Save rules</button>
        </div>
      </div>

      <div class="columns">
        <div class="stack">
          <s-section>
            <h2 class="panel-title">Rule builder</h2>
            <p class="muted small mt-0">The first rule that matches a product is used. Put specific rules above broad ones.</p>

            ${charts.length === 0
              ? `<div class="callout callout-warning"><strong>Create a chart first</strong><p>Rules need a chart to point at. <a class="link" href="/charts/new" data-link>Create a size chart</a>.</p></div>`
              : `
              <div class="card-flat" id="rule-form">
                <div class="field-row">
                  <div class="field">
                    <label for="rule-type">When a product matches</label>
                    <select id="rule-type">
                      ${Object.entries(MATCH_LABELS).map(([value, label]) => `<option value="${value}">${esc(label)}</option>`).join('')}
                    </select>
                  </div>
                  <div class="field">
                    <label for="rule-chart">Show this chart</label>
                    <select id="rule-chart">
                      ${charts.map((chart) => `<option value="${esc(chart.id)}">${esc(chart.name || 'Untitled chart')}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div id="rule-value-wrap"></div>
                <p class="field-error hidden" id="rule-error" role="alert"></p>
                <button class="btn btn-primary mt-8" id="add-rule">${icon('plus', 16)} Add rule</button>
              </div>`}

            <div class="divider"></div>

            <h3 class="panel-title mb-8">Current rules</h3>
            <div id="rules-list"></div>
          </s-section>

          <s-section>
            <h2 class="panel-title">Product overrides</h2>
            <p class="muted small mt-0">Override the rules for one specific product — useful for a single item that needs a different chart.</p>

            <div class="field">
              <label for="product-search">Find a product</label>
              <input type="search" id="product-search" placeholder="Search by product title" autocomplete="off" />
              <div id="product-results"></div>
            </div>
            <div id="override-assign"></div>

            <div class="divider"></div>
            <h3 class="panel-title mb-8">Products with an override</h3>
            <div id="override-list"></div>
          </s-section>
        </div>

        <aside class="rail">
          <div class="card">
            <h3>How precedence works</h3>
            <ul>
              <li><strong>1.</strong> Product override for that exact product.</li>
              <li><strong>2.</strong> First matching rule, top to bottom.</li>
              <li><strong>3.</strong> No match → no size guide button.</li>
            </ul>
          </div>
          <div class="card">
            <h3>Theme check</h3>
            <p class="small muted mt-0">Rules only show something if the theme has the Size Chart block or the Size Chart Float embed enabled.</p>
            <a class="link" href="/help" data-link>Theme setup steps</a>
          </div>
          <div class="card">
            <h3>Tip</h3>
            <p class="small muted mt-0">Add one rule for “All products” at the bottom as a fallback, then put collections or vendors above it.</p>
          </div>
        </aside>
      </div>
    `,
    mount(root) {
      const rulesList = root.querySelector('#rules-list');
      const dirtyBadge = root.querySelector('#rules-dirty');
      const saveButton = root.querySelector('#save-rules');

      const markDirty = () => {
        dirty = true;
        dirtyBadge?.classList.remove('hidden');
      };

      const setRuleError = (message) => {
        const el = root.querySelector('#rule-error');
        if (!el) return;
        el.textContent = message;
        el.classList.toggle('hidden', !message);
      };

      const renderRules = () => {
        if (!rulesList) return;
        rulesList.innerHTML = rules.length === 0
          ? '<p class="muted small">No rules yet. Products will not show a size guide unless a product override exists.</p>'
          : rules.map((rule, index) => `
            <div class="rule-row">
              <span class="rule-index">${index + 1}</span>
              <div class="rule-body">
                <div class="rule-text">${esc(describeRule(rule))}</div>
                <div class="rule-sub">${chartById(rule.chartId) ? `Shows “${esc(chartName(rule.chartId))}”` : '<span class="badge badge-critical">Chart missing</span>'}</div>
              </div>
              <div class="rule-actions">
                <button class="btn btn-icon" data-move="up" data-index="${index}" title="Move up" aria-label="Move rule up" ${index === 0 ? 'disabled' : ''}>${icon('arrowUp', 15)}</button>
                <button class="btn btn-icon" data-move="down" data-index="${index}" title="Move down" aria-label="Move rule down" ${index === rules.length - 1 ? 'disabled' : ''}>${icon('arrowDown', 15)}</button>
                <button class="btn btn-icon" data-remove-rule="${index}" title="Remove rule" aria-label="Remove rule">${icon('trash', 15)}</button>
              </div>
            </div>`).join('');
      };

      const renderOverrides = () => {
        const list = root.querySelector('#override-list');
        if (!list) return;
        const current = ctx.state.overrides;
        list.innerHTML = current.length === 0
          ? '<p class="muted small">No product overrides. Rules apply to every product.</p>'
          : current.map((entry) => `
            <div class="rule-row">
              <div class="rule-body">
                <div class="rule-text">${esc(entry.title || entry.productId)}</div>
                <div class="rule-sub">Shows “${esc(chartName(entry.chartId))}”</div>
              </div>
              <div class="rule-actions">
                <button class="btn btn-sm btn-critical" data-remove-override="${esc(entry.productId)}">Remove</button>
              </div>
            </div>`).join('');
      };

      const describeRule = (rule) => {
        const label = rule.match.label || rule.match.value || '';
        switch (rule.match.type) {
          case 'collection': return `Products in collection “${label}”`;
          case 'vendor': return `Products from vendor “${label}”`;
          case 'product_type': return `Products of type “${label}”`;
          case 'tag': return `Products tagged “${label}”`;
          case 'all': return 'All products (fallback)';
          default: return 'Unknown condition';
        }
      };

      // ── Rule value input ────────────────────────────────────────────────

      const renderValueInput = () => {
        const wrap = root.querySelector('#rule-value-wrap');
        const type = root.querySelector('#rule-type')?.value;
        if (!wrap) return;
        selectedCollection = null;

        if (type === 'collection') {
          wrap.innerHTML = `<div class="field">
            <label for="collection-search">Collection</label>
            <input type="search" id="collection-search" placeholder="Search collections" autocomplete="off" />
            <div id="collection-results"></div>
            <div id="collection-chosen"></div>
          </div>`;
          const input = wrap.querySelector('#collection-search');
          input?.addEventListener('input', debounce(async () => {
            const term = input.value.trim();
            if (term.length < 2) {
              wrap.querySelector('#collection-results').innerHTML = '';
              return;
            }
            try {
              const collections = await searchCollections(term);
              wrap.querySelector('#collection-results').innerHTML = collections.length
                ? `<div class="results">${collections.map((collection) => `
                    <button class="result" data-collection-id="${esc(collection.id)}" data-collection-handle="${esc(collection.handle)}" data-collection-title="${esc(collection.title)}">
                      <span class="thumb-empty"></span>
                      <span><span class="strong">${esc(collection.title)}</span><br /><span class="muted small">${esc(collection.handle)}</span></span>
                    </button>`).join('')}</div>`
                : '<p class="muted small">No collections found.</p>';
            } catch (error) {
              wrap.querySelector('#collection-results').innerHTML = `<p class="muted small">${esc(error instanceof Error ? error.message : 'Search failed')}</p>`;
            }
          }, 250));
          wrap.onclick = (event) => {
            const button = event.target.closest?.('[data-collection-id]');
            if (!button) return;
            selectedCollection = {
              id: button.dataset.collectionId,
              handle: button.dataset.collectionHandle,
              label: button.dataset.collectionTitle,
            };
            wrap.querySelector('#collection-results').innerHTML = '';
            wrap.querySelector('#collection-search').value = '';
            wrap.querySelector('#collection-chosen').innerHTML = `<p class="small mt-8">Selected: <span class="badge badge-accent">${esc(selectedCollection.label)}</span></p>`;
          };
        } else if (type === 'all') {
          wrap.innerHTML = '<p class="muted small mt-8">No extra condition — this rule matches every product.</p>';
        } else {
          const examples = { vendor: 'e.g. Nike', product_type: 'e.g. T-Shirts', tag: 'e.g. summer' };
          wrap.innerHTML = `<div class="field">
            <label for="rule-value">Value</label>
            <input type="text" id="rule-value" placeholder="${examples[type] ?? ''}" />
            <span class="hint">Must match exactly as stored in Shopify.</span>
          </div>`;
        }
      };

      root.querySelector('#rule-type')?.addEventListener('change', () => {
        setRuleError('');
        renderValueInput();
      });

      root.addEventListener('input', (event) => {
        if (event.target instanceof HTMLInputElement && event.target.id === 'rule-value') setRuleError('');
      });

      root.querySelector('#add-rule')?.addEventListener('click', () => {
        const type = root.querySelector('#rule-type').value;
        const chartId = root.querySelector('#rule-chart').value;
        if (!chartId) {
          setRuleError('Choose a chart first.');
          return;
        }

        let match;
        if (type === 'all') {
          match = { type: 'all', value: '' };
        } else if (type === 'collection') {
          if (!selectedCollection) {
            setRuleError('Search for and select a collection for this rule.');
            return;
          }
          match = { type, value: selectedCollection.id, handle: selectedCollection.handle, label: selectedCollection.label };
        } else {
          const value = root.querySelector('#rule-value')?.value.trim();
          if (!value) {
            setRuleError('Enter a value for this rule.');
            root.querySelector('#rule-value')?.focus();
            return;
          }
          match = { type, value, label: value };
        }

        rules.push({ id: createRuleId(), priority: rules.length + 1, match, chartId });
        setRuleError('');
        markDirty();
        renderRules();

        if (type !== 'all') {
          const input = root.querySelector('#rule-value');
          if (input) input.value = '';
          if (type === 'collection') renderValueInput();
        }
      });

      rulesList?.addEventListener('click', (event) => {
        const move = event.target.closest?.('[data-move]');
        if (move) {
          const index = Number(move.dataset.index);
          const target = move.dataset.move === 'up' ? index - 1 : index + 1;
          if (target < 0 || target >= rules.length) return;
          [rules[index], rules[target]] = [rules[target], rules[index]];
          markDirty();
          renderRules();
          return;
        }
        const remove = event.target.closest?.('[data-remove-rule]');
        if (remove) {
          rules.splice(Number(remove.dataset.removeRule), 1);
          markDirty();
          renderRules();
        }
      });

      saveButton?.addEventListener('click', async () => {
        saveButton.disabled = true;
        saveButton.textContent = 'Saving…';
        try {
          await saveRules(rules);
          await ctx.refresh();
          rules = ctx.state.rules.map((rule) => ({ ...rule, match: { ...rule.match } }));
          dirty = false;
          dirtyBadge?.classList.add('hidden');
          ctx.toast('Assignment rules saved. The storefront updates immediately.');
          renderRules();
        } catch (error) {
          ctx.toast(error instanceof Error ? error.message : 'Could not save rules.', 'critical');
        } finally {
          saveButton.disabled = false;
          saveButton.textContent = 'Save rules';
        }
      });

      // ── Product overrides ───────────────────────────────────────────────

      const productInput = root.querySelector('#product-search');
      const productResults = root.querySelector('#product-results');
      const assignWrap = root.querySelector('#override-assign');

      productInput?.addEventListener('input', debounce(async () => {
        const term = productInput.value.trim();
        if (term.length < 2) {
          productResults.innerHTML = '';
          return;
        }
        try {
          const products = await searchProducts(term);
          productResults.innerHTML = products.length
            ? `<div class="results">${products.map((product) => `
                <button class="result" data-product-id="${esc(product.id)}" data-product-title="${esc(product.title)}" data-product-handle="${esc(product.handle)}">
                  <span class="thumb-empty"></span>
                  <span><span class="strong">${esc(product.title)}</span><br /><span class="muted small">${esc(product.handle)}</span></span>
                </button>`).join('')}</div>`
            : '<p class="muted small">No products found.</p>';
        } catch (error) {
          productResults.innerHTML = `<p class="muted small">${esc(error instanceof Error ? error.message : 'Search failed')}</p>`;
        }
      }, 250));

      productResults?.addEventListener('click', (event) => {
        const button = event.target.closest?.('[data-product-id]');
        if (!button) return;
        pendingProduct = {
          id: button.dataset.productId,
          title: button.dataset.productTitle,
          handle: button.dataset.productHandle,
        };
        productResults.innerHTML = '';
        productInput.value = '';
        assignWrap.innerHTML = `<div class="card-flat mt-8">
          <p class="small mt-0">Override the chart for <strong>${esc(pendingProduct.title)}</strong></p>
          <div class="row">
            <select id="override-chart" style="max-width:280px">
              ${charts.map((chart) => `<option value="${esc(chart.id)}">${esc(chart.name || 'Untitled chart')}</option>`).join('')}
            </select>
            <button class="btn btn-primary" id="assign-override">Assign override</button>
            <button class="btn" id="cancel-override">Cancel</button>
          </div>
        </div>`;
      });

      assignWrap?.addEventListener('click', async (event) => {
        if (event.target.closest?.('#cancel-override')) {
          pendingProduct = null;
          assignWrap.innerHTML = '';
          return;
        }
        const button = event.target.closest?.('#assign-override');
        if (!button || !pendingProduct) return;
        const chartId = root.querySelector('#override-chart').value;
        button.disabled = true;
        try {
          await setProductOverride(pendingProduct.id, chartId);
          await saveOverrideEntry({
            productId: pendingProduct.id,
            title: pendingProduct.title,
            handle: pendingProduct.handle,
            chartId,
          });
          await ctx.refresh();
          ctx.toast(`Override saved for “${pendingProduct.title}”.`);
          pendingProduct = null;
          assignWrap.innerHTML = '';
          renderOverrides();
        } catch (error) {
          button.disabled = false;
          ctx.toast(error instanceof Error ? error.message : 'Could not save the override.', 'critical');
        }
      });

      root.querySelector('#override-list')?.addEventListener('click', async (event) => {
        const button = event.target.closest?.('[data-remove-override]');
        if (!button) return;
        const productId = button.dataset.removeOverride;
        const ok = await ctx.confirm({
          title: 'Remove this product override?',
          message: 'The product will fall back to the matching assignment rules.',
          confirmLabel: 'Remove override',
          tone: 'critical',
        });
        if (!ok) return;
        button.disabled = true;
        try {
          await clearProductOverride(productId);
          await removeOverrideEntry(productId);
          await ctx.refresh();
          ctx.toast('Override removed.');
          renderOverrides();
        } catch (error) {
          button.disabled = false;
          ctx.toast(error instanceof Error ? error.message : 'Could not remove the override.', 'critical');
        }
      });

      renderRules();
      renderOverrides();
      renderValueInput();
    },
  };
}
