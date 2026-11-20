import { DEFAULT_SETTINGS, SIZE_SYSTEMS, saveSettings } from '../lib/sizeChart.js';
import { themeEditorUrl } from '../lib/billing.js';
import { showSaveBar, hideSaveBar } from '../lib/saveBar.js';
import { buildBackup, importBackup, validateBackup } from '../lib/backup.js';
import { esc, icon, download } from '../ui.js';

const SAVE_BAR_ID = 'settings-save-bar';

const DISPLAY_MODES = [
  ['modal', 'Modal (centered pop-up)'],
  ['drawer', 'Side drawer'],
  ['inline', 'Inline on the page'],
  ['accordion', 'Accordion'],
  ['link', 'Text link next to the variant picker'],
];

export async function render(ctx) {
  const settings = { ...DEFAULT_SETTINGS, ...(ctx.state.settings ?? {}) };
  let dirty = false;

  return {
    heading: 'Settings',
    html: `
      <div class="row-between mb-16">
        <p class="page-intro mt-0">Store-wide defaults for the size guide button and window. These apply on the next storefront page load.</p>
      </div>

      <div class="columns">
        <div class="stack">
          <s-section>
            <h2 class="panel-title mb-8">Button</h2>
            <div class="field-row">
              <div class="field">
                <label for="button-text">Button text</label>
                <input id="button-text" type="text" data-setting="buttonText" value="${esc(settings.buttonText)}" placeholder="Size guide" />
                <span class="hint">Used when the theme block does not set its own text.</span>
              </div>
              <div class="field">
                <label for="button-position">Floating button position</label>
                <select id="button-position" data-setting="buttonPosition">
                  <option value="bottom-right" ${settings.buttonPosition === 'bottom-right' ? 'selected' : ''}>Bottom right</option>
                  <option value="bottom-left" ${settings.buttonPosition === 'bottom-left' ? 'selected' : ''}>Bottom left</option>
                </select>
                <span class="hint">Only used by the floating app embed.</span>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="primary-color">Button colour</label>
                <div class="row">
                  <input id="primary-color" type="color" data-setting="primaryColor" value="${esc(settings.primaryColor)}" />
                  <span class="mono" id="primary-color-value">${esc(settings.primaryColor)}</span>
                </div>
              </div>
              <div class="field">
                <label for="border-radius">Corner radius</label>
                <input id="border-radius" type="text" data-setting="borderRadius" value="${esc(settings.borderRadius)}" placeholder="8px" />
                <p class="field-error hidden" id="radius-error" role="alert"></p>
                <span class="hint">Any CSS length, for example 4px or 0.</span>
              </div>
            </div>
          </s-section>

          <s-section>
            <h2 class="panel-title mb-8">Chart window</h2>
            <div class="field-row">
              <div class="field">
                <label for="display-mode">Display mode</label>
                <select id="display-mode" data-setting="displayMode">
                  ${DISPLAY_MODES.map(([value, label]) => `<option value="${value}" ${settings.displayMode === value ? 'selected' : ''}>${label}</option>`).join('')}
                </select>
                <span class="hint">How the chart opens from the Size guide button. The text-link mode places a link under the variant picker and opens a modal.</span>
              </div>
              <div class="field">
                <label for="default-unit">Default unit</label>
                <select id="default-unit" data-setting="defaultUnit">
                  <option value="cm" ${settings.defaultUnit === 'cm' ? 'selected' : ''}>Centimetres (cm)</option>
                  <option value="in" ${settings.defaultUnit === 'in' ? 'selected' : ''}>Inches (in)</option>
                </select>
                <span class="hint">Customers can still switch units in the chart.</span>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="size-system">Default size system</label>
                <select id="size-system" data-setting="defaultSizeSystem">
                  ${SIZE_SYSTEMS.map((system) => `<option value="${system}" ${settings.defaultSizeSystem === system ? 'selected' : ''}>${system}</option>`).join('')}
                </select>
                <span class="hint">Used when a chart has a matching US / EU / UK / IN / AU / JP / IT / FR column.</span>
              </div>
              <div class="field">
                <label>Find my size</label>
                <label class="check"><input type="checkbox" data-setting="showCalculator" ${settings.showCalculator ? 'checked' : ''} /> Show the Find my size calculator</label>
                <span class="hint">Only appears when the chart has measurement columns.</span>
              </div>
              <div class="field">
                <label>Fit feedback</label>
                <label class="check"><input type="checkbox" data-setting="showFeedback" ${settings.showFeedback !== false ? 'checked' : ''} /> Ask shoppers “Runs small / True to size / Runs large”</label>
                <span class="hint">Results appear on the Dashboard. Votes are stored per chart.</span>
              </div>
            </div>
          </s-section>

          <s-section>
            <h2 class="panel-title mb-8">Button placement in the theme</h2>
            <p class="muted small mt-0">Theme settings can override the button text, colour and position for a specific block or embed.</p>
            <div class="row">
              <a class="btn" href="${esc(themeEditorUrl('block'))}" target="_top">${icon('external', 15)} Product template editor</a>
              <a class="btn" href="${esc(themeEditorUrl('embeds'))}" target="_top">${icon('external', 15)} App embeds</a>
            </div>
            <p class="hint mt-8">In the theme editor, add the <strong>Size Chart</strong> block to the product template, or turn on the <strong>Size Chart Float</strong> app embed. Use one, not both, to avoid two buttons.</p>
          </s-section>

          <s-section>
            <h2 class="panel-title mb-8">Backup & restore</h2>
            <p class="muted small mt-0">Download every size chart, assignment rule, product override and setting in one JSON file. Restore it on this store or move your setup to another store.</p>
            <div class="row">
              <button class="btn" id="export-backup">${icon('external', 15)} Export backup</button>
              <button class="btn" id="import-backup">Import backup</button>
              <input type="file" id="backup-input" accept="application/json,.json" class="hidden" />
            </div>
            <p class="hint mt-8">Import adds charts that are missing, updates charts that share an ID, and replaces the assignment rules with the ones in the file.</p>
          </s-section>
        </div>

        <aside class="rail">
          <div class="card preview-card">
            <div class="row-between mb-8">
              <h3>Live preview</h3>
              <span class="badge">Product page</span>
            </div>
            <div class="preview-frame" id="preview-frame" data-mode="${esc(settings.displayMode)}">
              <div class="preview-product">
                <div class="preview-line w60"></div>
                <div class="preview-line w35"></div>
                <div class="preview-chips">
                  <span>S</span><span>M</span><span>L</span>
                </div>
                <button type="button" class="preview-trigger" id="preview-trigger">${esc(settings.buttonText || 'Size guide')}</button>
              </div>
              <div class="preview-float" id="preview-float">${esc(settings.buttonText || 'Size guide')}</div>
              <div class="preview-backdrop"></div>
              <div class="preview-sheet" id="preview-sheet">
                <div class="preview-sheet-head">
                  <strong>Size guide</strong>
                  <span class="preview-x">×</span>
                </div>
                <div class="preview-table">
                  <div class="preview-tr preview-th"><span>Size</span><span>Chest</span><span>Waist</span></div>
                  <div class="preview-tr"><span>M</span><span>91–97</span><span>76–81</span></div>
                  <div class="preview-tr"><span>L</span><span>97–102</span><span>81–86</span></div>
                </div>
                <div class="preview-calc">Find my size</div>
              </div>
            </div>
            <p class="hint mt-8">Position shows on the floating embed. The sheet follows Display mode.</p>
          </div>
          <div class="card">
            <h3>Where these settings are read</h3>
            <ul>
              <li>Saved to the shop-level <span class="mono">$app:settings</span> metafield.</li>
              <li>The storefront reads them on every product page.</li>
              <li>Block settings take priority when the theme sets them.</li>
            </ul>
          </div>
          <div class="card">
            <h3>Units</h3>
            <p class="small muted mt-0">Measurements are stored in each chart's base unit. The storefront converts cm ↔ inches for display, and leaves labels like US sizes untouched.</p>
          </div>
          <div class="card">
            <h3>Need exact steps?</h3>
            <p class="small muted mt-0">The Help page walks through theme setup and troubleshooting.</p>
            <a class="link" href="/help" data-link>Open Help</a>
          </div>
        </aside>
      </div>

      <ui-save-bar id="${SAVE_BAR_ID}">
        <button variant="primary" id="save-settings">Save settings</button>
        <button id="discard-settings">Discard</button>
      </ui-save-bar>
    `,
    mount(root) {
      const saveButton = root.querySelector('#save-settings');
      const preview = {
        frame: root.querySelector('#preview-frame'),
        trigger: root.querySelector('#preview-trigger'),
        float: root.querySelector('#preview-float'),
        sheet: root.querySelector('#preview-sheet'),
      };

      const applyPreview = () => {
        if (!preview.frame) return;
        preview.frame.dataset.mode = settings.displayMode;
        preview.float?.classList.toggle('preview-float-left', settings.buttonPosition === 'bottom-left');
        for (const button of [preview.trigger, preview.float]) {
          if (!button) continue;
          const isLink = button === preview.trigger && settings.displayMode === 'link';
          button.textContent = settings.buttonText || 'Size guide';
          button.style.background = isLink ? 'transparent' : settings.primaryColor;
          button.style.color = isLink ? settings.primaryColor : '';
          button.style.borderRadius = isLink ? '0' : settings.borderRadius || '8px';
          button.classList.toggle('is-link', isLink);
        }
      };

      applyPreview();

      const radiusInput = root.querySelector('#border-radius');
      const setRadiusError = (message) => {
        const el = root.querySelector('#radius-error');
        if (!el) return;
        el.textContent = message;
        el.classList.toggle('hidden', !message);
        radiusInput?.classList.toggle('field-invalid', Boolean(message));
      };

      const markDirty = () => {
        if (dirty) return;
        dirty = true;
        showSaveBar(SAVE_BAR_ID);
      };

      root.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
        const key = target.dataset.setting;
        if (!key) return;
        if (target instanceof HTMLInputElement && target.type === 'checkbox') settings[key] = target.checked;
        else settings[key] = target.value;
        if (key === 'primaryColor') {
          const value = root.querySelector('#primary-color-value');
          if (value) value.textContent = target.value;
        }
        if (key === 'borderRadius') setRadiusError('');
        applyPreview();
        markDirty();
      });

      root.querySelector('#discard-settings')?.addEventListener('click', async () => {
        dirty = false;
        hideSaveBar(SAVE_BAR_ID);
        await ctx.rerender();
      });

      saveButton?.addEventListener('click', async () => {
        const radius = String(settings.borderRadius ?? '').trim();
        if (radius && globalThis.CSS?.supports && !CSS.supports('border-radius', radius)) {
          setRadiusError('Use a CSS length such as 8px, 0.5rem or 0.');
          radiusInput?.focus();
          return;
        }
        setRadiusError('');

        saveButton.disabled = true;
        saveButton.textContent = 'Saving…';
        try {
          await saveSettings(settings);
          await ctx.refresh();
          dirty = false;
          hideSaveBar(SAVE_BAR_ID);
          ctx.toast('Settings saved. The storefront picks them up on the next page load.');
        } catch (error) {
          ctx.toast(error instanceof Error ? error.message : 'Could not save settings.', 'critical');
        } finally {
          saveButton.disabled = false;
          saveButton.textContent = 'Save settings';
        }
      });

      const exportButton = root.querySelector('#export-backup');
      exportButton?.addEventListener('click', async () => {
        exportButton.disabled = true;
        try {
          const bundle = await buildBackup(window.shopify?.config?.shop ?? '');
          const date = new Date().toISOString().slice(0, 10);
          download(`advanced-size-chart-backup-${date}.json`, JSON.stringify(bundle, null, 2), 'application/json');
          ctx.toast(`Backup downloaded with ${bundle.charts.length} chart(s).`);
        } catch (error) {
          ctx.toast(error instanceof Error ? error.message : 'Could not create the backup.', 'critical');
        } finally {
          exportButton.disabled = false;
        }
      });

      const importButton = root.querySelector('#import-backup');
      const fileInput = root.querySelector('#backup-input');
      importButton?.addEventListener('click', () => fileInput?.click());
      fileInput?.addEventListener('change', async () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        importButton.disabled = true;
        try {
          const bundle = validateBackup(JSON.parse(await file.text()));
          const ruleCount = Array.isArray(bundle.rules) ? bundle.rules.length : 0;
          const ok = await ctx.confirm({
            title: 'Restore this backup?',
            message: `${bundle.charts.length} chart(s) will be restored and the assignment rules replaced with ${ruleCount} from the file. Charts that are not in the file stay as they are.`,
            confirmLabel: 'Restore backup',
            tone: 'critical',
          });
          if (!ok) return;
          const result = await importBackup(bundle);
          await ctx.refresh();
          ctx.toast(`Backup restored: ${result.created} new chart(s), ${result.updated} updated, ${result.rules} rule(s).`);
        } catch (error) {
          ctx.toast(error instanceof Error ? error.message : 'Could not restore the backup.', 'critical');
        } finally {
          importButton.disabled = false;
          fileInput.value = '';
        }
      });
    },
  };
}
