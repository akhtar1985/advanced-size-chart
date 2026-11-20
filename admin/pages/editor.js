import {
  EMPTY_TABLE,
  SIZE_SYSTEMS,
  emptyChart,
  fetchChart,
  createChart,
  updateChart,
  deleteChart,
  duplicateChart,
  publishChartsIndex,
} from '../lib/sizeChart.js';
import { PRESETS, PRESET_COUNT } from '../lib/presets.js';
import { presetPickerMarkup, bindPresetPicker } from '../lib/presetPicker.js';
import { showSaveBar, hideSaveBar } from '../lib/saveBar.js';
import { MEASURE_DIAGRAMS, isDiagramFile } from '../lib/measureDiagrams.js';
import { esc, icon, plural } from '../ui.js';

const SAVE_BAR_ID = 'editor-save-bar';

const UNIT_OPTIONS = ['', 'cm', 'in', 'mm'];

const TRANSLATION_LOCALES = [
  ['fr', 'French (fr)'],
  ['de', 'German (de)'],
  ['es', 'Spanish (es)'],
  ['it', 'Italian (it)'],
  ['pt-BR', 'Portuguese — Brazil (pt-BR)'],
  ['pt-PT', 'Portuguese — Portugal (pt-PT)'],
  ['nl', 'Dutch (nl)'],
  ['da', 'Danish (da)'],
  ['sv', 'Swedish (sv)'],
  ['nb', 'Norwegian (nb)'],
  ['fi', 'Finnish (fi)'],
  ['pl', 'Polish (pl)'],
  ['cs', 'Czech (cs)'],
  ['sk', 'Slovak (sk)'],
  ['hu', 'Hungarian (hu)'],
  ['ro', 'Romanian (ro)'],
  ['el', 'Greek (el)'],
  ['tr', 'Turkish (tr)'],
  ['ru', 'Russian (ru)'],
  ['uk', 'Ukrainian (uk)'],
  ['ar', 'Arabic (ar)'],
  ['he', 'Hebrew (he)'],
  ['hi', 'Hindi (hi)'],
  ['ja', 'Japanese (ja)'],
  ['ko', 'Korean (ko)'],
  ['zh-CN', 'Chinese — Simplified (zh-CN)'],
  ['zh-TW', 'Chinese — Traditional (zh-TW)'],
  ['th', 'Thai (th)'],
  ['vi', 'Vietnamese (vi)'],
  ['id', 'Indonesian (id)'],
  ['ms', 'Malay (ms)'],
];

function localeLabel(code) {
  return TRANSLATION_LOCALES.find(([value]) => value.toLowerCase() === code.toLowerCase())?.[1] ?? code;
}

function translationSection(chart) {
  const entries = Object.entries(chart.translations ?? {});
  const used = new Set(entries.map(([code]) => code));
  const available = TRANSLATION_LOCALES.filter(([code]) => !used.has(code));

  return `<s-section>
    <h2 class="panel-title mb-8">Translations</h2>
    <p class="muted small mt-0">Add translated chart text per storefront language. Shoppers see it automatically when the storefront locale matches; anything left blank falls back to the default text.</p>

    ${entries.length === 0
      ? '<p class="muted small">No translations yet. The chart uses the text above in every language.</p>'
      : entries.map(([code, entry]) => translationCard(chart, code, entry)).join('')}

    <div class="row mt-8">
      <select id="translation-locale" style="max-width:240px" ${available.length === 0 ? 'disabled' : ''}>
        ${available.map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('')}
      </select>
      <button class="btn btn-sm" data-add-translation ${available.length === 0 ? 'disabled' : ''}>${icon('plus', 14)} Add translation</button>
    </div>
  </s-section>`;
}

function translationCard(chart, code, entry) {
  const trTables = Array.isArray(entry.tables) ? entry.tables : [];
  return `<div class="card-flat mt-8">
    <div class="row-between mb-8">
      <h3 class="panel-title mb-0">${esc(localeLabel(code))}</h3>
      <button class="btn btn-sm btn-critical" data-remove-translation="${esc(code)}">Remove</button>
    </div>
    <div class="field">
      <label>Chart name</label>
      <input type="text" data-tr-locale="${esc(code)}" data-tr-field="name" value="${esc(entry.name ?? '')}" placeholder="${esc(chart.name)}" />
    </div>
    <div class="field">
      <label>Fit notes</label>
      <textarea data-tr-locale="${esc(code)}" data-tr-field="fit_notes" placeholder="${esc(chart.fit_notes)}">${esc(entry.fit_notes ?? '')}</textarea>
    </div>
    <div class="field">
      <label>How to measure</label>
      <textarea data-tr-locale="${esc(code)}" data-tr-field="measure_instructions" placeholder="${esc(chart.measure_instructions)}">${esc(entry.measure_instructions ?? '')}</textarea>
    </div>
    ${chart.tables.map((table, tableIndex) => {
      const trTable = trTables[tableIndex] ?? {};
      const trColumns = trTable.columns ?? {};
      return `<div class="divider"></div>
        <div class="field">
          <label>Table ${tableIndex + 1} name</label>
          <input type="text" data-tr-locale="${esc(code)}" data-tr-table="${tableIndex}" value="${esc(trTable.name ?? '')}" placeholder="${esc(table.name || `Table ${tableIndex + 1}`)}" />
        </div>
        <div class="field-row">
          ${table.columns.map((column) => `<div class="field">
            <label>${esc(column)}</label>
            <input type="text" data-tr-locale="${esc(code)}" data-tr-table="${tableIndex}" data-tr-column="${esc(column)}" value="${esc(trColumns[column] ?? '')}" placeholder="${esc(column)}" />
          </div>`).join('')}
        </div>`;
    }).join('')}
  </div>`;
}

function convertHwRows(rows, fields, factor) {
  for (const row of rows ?? []) {
    for (const field of fields) {
      const value = Number.parseFloat(String(row[field] ?? '').replace(',', '.'));
      if (Number.isFinite(value)) row[field] = String(Math.round(value * factor * 10) / 10);
    }
  }
}

function heightWeightMarkup(table) {
  const guide = table?.heightWeight;
  const rows = Array.isArray(guide?.rows) ? guide.rows : [];
  const heightUnit = guide?.heightUnit === 'in' ? 'in' : 'cm';
  const weightUnit = guide?.weightUnit === 'lb' ? 'lb' : 'kg';

  const cell = (index, field, value, label, inputMode = 'numeric') => `
    <td><input class="cell-input" type="number" inputmode="${inputMode}" step="0.1" min="0"
      data-hw-cell="${index}:${field}" value="${esc(value)}" aria-label="${esc(label)}" /></td>`;

  return `<div class="card-flat mt-8" data-hw-editor>
    <div class="row-between">
      <div>
        <h3 class="panel-title mb-0">Height & weight guide</h3>
        <p class="hint mt-0">Optional. Adds a second finder to this table: shoppers enter height and weight and get a size. Fill one range per size.</p>
      </div>
      ${guide
        ? `<button class="btn btn-sm btn-critical" data-hw-remove>${icon('trash', 14)} Remove guide</button>`
        : `<button class="btn btn-sm" data-hw-add>${icon('plus', 14)} Add height & weight guide</button>`}
    </div>

    ${guide ? `
      <div class="field-row mt-8">
        <div class="field">
          <label for="hw-height-unit">Height unit</label>
          <select id="hw-height-unit" data-hw-unit="height">
            <option value="cm" ${heightUnit === 'cm' ? 'selected' : ''}>Centimetres (cm)</option>
            <option value="in" ${heightUnit === 'in' ? 'selected' : ''}>Inches (in)</option>
          </select>
        </div>
        <div class="field">
          <label for="hw-weight-unit">Weight unit</label>
          <select id="hw-weight-unit" data-hw-unit="weight">
            <option value="kg" ${weightUnit === 'kg' ? 'selected' : ''}>Kilograms (kg)</option>
            <option value="lb" ${weightUnit === 'lb' ? 'selected' : ''}>Pounds (lb)</option>
          </select>
        </div>
      </div>

      ${rows.length === 0 ? '<p class="muted small">No size rows yet. Add one row per size.</p>' : `
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Height from (${esc(heightUnit)})</th>
                <th>Height to (${esc(heightUnit)})</th>
                <th>Weight from (${esc(weightUnit)})</th>
                <th>Weight to (${esc(weightUnit)})</th>
                <th style="width:36px"></th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((row, index) => `
                <tr>
                  <td><input class="cell-input" type="text" data-hw-cell="${index}:size" value="${esc(row.size)}" aria-label="Size" /></td>
                  ${cell(index, 'heightMin', row.heightMin, `Minimum height for ${row.size || `row ${index + 1}`}`)}
                  ${cell(index, 'heightMax', row.heightMax, `Maximum height for ${row.size || `row ${index + 1}`}`)}
                  ${cell(index, 'weightMin', row.weightMin, `Minimum weight for ${row.size || `row ${index + 1}`}`)}
                  ${cell(index, 'weightMax', row.weightMax, `Maximum weight for ${row.size || `row ${index + 1}`}`)}
                  <td><button class="btn btn-icon" data-hw-remove-row="${index}" title="Remove row" aria-label="Remove row">${icon('trash', 14)}</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`}

      <button class="btn btn-sm mt-8" data-hw-add-row>${icon('plus', 14)} Add size row</button>
    ` : ''}
  </div>`;
}

export async function render(ctx, params) {
  const isNew = !params?.id;
  let chartId = params?.id ?? null;
  let chart;
  let activeTable = 0;

  if (isNew) {
    chart = emptyChart();
  } else {
    chart = await fetchChart(chartId);
  }

  const isNewChart = () => isNew && !chartId;

  return {
    heading: isNew ? 'New size chart' : 'Edit size chart',
    html: `
      <div id="editor-root">
        <div class="page-actions">
          <span class="badge badge-warning hidden" id="dirty-badge">Unsaved changes</span>
          <span class="spacer"></span>
          <a class="btn" href="/charts" data-link>Back to charts</a>
          ${!isNew ? `<button class="btn" data-action="duplicate">${icon('copy', 16)} Duplicate</button>` : ''}
          <button class="btn" data-action="export-json">Export JSON</button>
          <button class="btn btn-primary" data-action="save">Save chart</button>
        </div>
        <div id="editor-body">${bodyMarkup(chart, activeTable, isNew)}</div>
        <ui-save-bar id="${SAVE_BAR_ID}">
          <button variant="primary" data-action="save">Save chart</button>
          <button data-action="discard">Discard</button>
        </ui-save-bar>
      </div>
    `,
    mount(root) {
      const editorRoot = root.querySelector('#editor-root') ?? root;
      const editorBody = root.querySelector('#editor-body');
      const dirtyBadge = root.querySelector('#dirty-badge');
      bindPresetPicker(root);

      let dirty = false;
      const markDirty = () => {
        dirtyBadge?.classList.remove('hidden');
        if (dirty) return;
        dirty = true;
        showSaveBar(SAVE_BAR_ID);
      };
      const markClean = () => {
        dirty = false;
        dirtyBadge?.classList.add('hidden');
        hideSaveBar(SAVE_BAR_ID);
      };

      const setFieldError = (selector, message) => {
        const el = root.querySelector(selector);
        if (!el) return;
        el.textContent = message;
        el.classList.toggle('hidden', !message);
      };
      const showNameError = (message) => {
        setFieldError('#name-error', message);
        root.querySelector('[data-field="name"]')?.classList.toggle('field-invalid', Boolean(message));
      };
      const showTablesError = (message) => setFieldError('#tables-error', message);

      const measureImageSrc = (value) => {
        if (!value) return '';
        if (/^https?:\/\//i.test(value)) return value;
        if (value.startsWith('/diagrams/')) return value;
        return `/diagrams/${value}`;
      };

      const updateMeasurePreview = () => {
        const wrap = root.querySelector('#measure-preview');
        if (!wrap) return;
        const value = (chart.measure_image || '').trim();
        const select = root.querySelector('#measure-diagram');
        if (select) select.value = isDiagramFile(value) ? value : value ? '__custom' : '';
        if (!value) {
          wrap.classList.add('hidden');
          wrap.innerHTML = '';
          return;
        }
        wrap.innerHTML = `<img src="${esc(measureImageSrc(value))}" alt="Measuring diagram preview" loading="lazy" />`;
        wrap.classList.remove('hidden');
      };

      const rerenderBody = () => {
        editorBody.innerHTML = bodyMarkup(chart, activeTable, isNewChart());
        updateMeasurePreview();
        editorBody.scrollIntoView({ block: 'nearest' });
      };

      editorRoot.addEventListener('input', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (target.dataset.trLocale) {
          const entry = chart.translations?.[target.dataset.trLocale];
          if (!entry) return;
          const tableIndex = target.dataset.trTable !== undefined ? Number(target.dataset.trTable) : null;
          if (tableIndex !== null) {
            entry.tables ??= [];
            entry.tables[tableIndex] ??= { name: '', columns: {} };
            const trTable = entry.tables[tableIndex];
            if (target.dataset.trColumn !== undefined) {
              trTable.columns ??= {};
              trTable.columns[target.dataset.trColumn] = target.value;
            } else {
              trTable.name = target.value;
            }
          } else if (target.dataset.trField) {
            entry[target.dataset.trField] = target.value;
          }
          markDirty();
          return;
        }
        if (target.dataset.field) {
          chart[target.dataset.field] = target.value;
          if (target.dataset.field === 'name') showNameError('');
          if (target.dataset.field === 'measure_image') updateMeasurePreview();
          markDirty();
          return;
        }
        if (target.dataset.tableName !== undefined) {
          table().name = target.value;
          markDirty();
          return;
        }
        if (target.dataset.tableVariantOption !== undefined || target.dataset.tableVariantValue !== undefined) {
          const optionInput = root.querySelector('[data-table-variant-option]');
          const valueInput = root.querySelector('[data-table-variant-value]');
          const option = optionInput ? optionInput.value : table().variant?.option ?? '';
          const value = valueInput ? valueInput.value : table().variant?.value ?? '';
          if (option.trim() || value.trim()) table().variant = { option: option.trim(), value: value.trim() };
          else delete table().variant;
          markDirty();
          return;
        }
        if (target.dataset.hwCell) {
          const [index, field] = target.dataset.hwCell.split(':');
          const guide = table().heightWeight;
          const row = guide?.rows?.[Number(index)];
          if (row && field in row) {
            row[field] = target.value;
            markDirty();
          }
          return;
        }
        if (target.dataset.header !== undefined) {
          renameColumn(Number(target.dataset.header), target.value);
          markDirty();
          return;
        }
        if (target.dataset.cell) {
          const [row, column] = target.dataset.cell.split(':').map(Number);
          table().rows[row][column] = target.value;
          markDirty();
        }
      });

      editorRoot.addEventListener('change', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

        if (target.id === 'measure-diagram') {
          if (target.value === '__custom') {
            root.querySelector('#measure-image')?.focus();
            return;
          }
          chart.measure_image = target.value;
          const input = root.querySelector('#measure-image');
          if (input) input.value = target.value;
          updateMeasurePreview();
          markDirty();
          return;
        }
        if (target.dataset.defaultUnit !== undefined) {
          chart.default_unit = target.value;
          markDirty();
          return;
        }
        if (target.dataset.hwUnit) {
          const guide = table().heightWeight;
          if (!guide) return;
          if (target.dataset.hwUnit === 'height') {
            const next = target.value === 'in' ? 'in' : 'cm';
            if (next !== guide.heightUnit) {
              convertHwRows(guide.rows, ['heightMin', 'heightMax'], guide.heightUnit === 'in' ? 2.54 : 1 / 2.54);
              guide.heightUnit = next;
            }
          } else {
            const next = target.value === 'lb' ? 'lb' : 'kg';
            if (next !== guide.weightUnit) {
              convertHwRows(guide.rows, ['weightMin', 'weightMax'], guide.weightUnit === 'lb' ? 0.45359237 : 1 / 0.45359237);
              guide.weightUnit = next;
            }
          }
          markDirty();
          rerenderBody();
          return;
        }
        if (target.dataset.unitCol !== undefined) {
          const column = Number(target.dataset.unitCol);
          const name = table().columns[column];
          if (!name) return;
          if (target.value) table().units[name] = target.value;
          else delete table().units[name];
          markDirty();
          return;
        }
        if (target.dataset.system) {
          const system = target.dataset.system;
          const systems = new Set(chart.size_systems);
          if (target.checked) systems.add(system);
          else systems.delete(system);
          chart.size_systems = SIZE_SYSTEMS.filter((item) => systems.has(item));
          markDirty();
          return;
        }
        if (target.id === 'csv-input' && target instanceof HTMLInputElement && target.files?.[0]) {
          importCsv(target.files[0]);
          target.value = '';
        }
      });

      editorRoot.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-action], [data-tab], [data-preset], [data-remove-row], [data-remove-col], [data-remove-table], [data-add-translation], [data-remove-translation], [data-hw-add], [data-hw-remove], [data-hw-add-row], [data-hw-remove-row]');
        if (!button) return;

        if (button.hasAttribute('data-add-translation')) {
          const select = root.querySelector('#translation-locale');
          const code = select?.value?.toLowerCase();
          if (!code) return;
          chart.translations ??= {};
          if (chart.translations[code]) return;
          chart.translations[code] = {
            name: '',
            fit_notes: '',
            measure_instructions: '',
            tables: chart.tables.map(() => ({ name: '', columns: {} })),
          };
          markDirty();
          rerenderBody();
          return;
        }

        if (button.dataset.removeTranslation) {
          const ok = await ctx.confirm({
            title: 'Remove this translation?',
            message: 'Shoppers using that storefront language will see the default chart text again.',
            confirmLabel: 'Remove translation',
            tone: 'critical',
          });
          if (!ok) return;
          delete chart.translations?.[button.dataset.removeTranslation];
          markDirty();
          rerenderBody();
          return;
        }

        if (button.hasAttribute('data-hw-add')) {
          table().heightWeight = {
            heightUnit: 'cm',
            weightUnit: 'kg',
            rows: table().rows.map((row) => ({
              size: String(row?.[0] ?? ''),
              heightMin: '',
              heightMax: '',
              weightMin: '',
              weightMax: '',
            })),
          };
          markDirty();
          rerenderBody();
          return;
        }

        if (button.hasAttribute('data-hw-remove')) {
          const ok = await ctx.confirm({
            title: 'Remove the height & weight guide?',
            message: 'The height and weight finder disappears from the storefront for this table. Your measurement table stays as it is.',
            confirmLabel: 'Remove guide',
            tone: 'critical',
          });
          if (!ok) return;
          delete table().heightWeight;
          markDirty();
          rerenderBody();
          return;
        }

        if (button.dataset.hwAddRow !== undefined) {
          table().heightWeight?.rows.push({ size: '', heightMin: '', heightMax: '', weightMin: '', weightMax: '' });
          markDirty();
          rerenderBody();
          return;
        }

        if (button.dataset.hwRemoveRow !== undefined) {
          table().heightWeight?.rows.splice(Number(button.dataset.hwRemoveRow), 1);
          markDirty();
          rerenderBody();
          return;
        }

        if (button.dataset.tab !== undefined) {
          activeTable = Number(button.dataset.tab);
          rerenderBody();
          return;
        }

        if (button.dataset.preset !== undefined) {
          const preset = PRESETS[Number(button.dataset.preset)];
          if (!preset) return;
          chart = JSON.parse(JSON.stringify(preset.chart));
          chart.fit_notes ??= '';
          chart.measure_instructions ??= '';
          chart.measure_image ??= '';
          activeTable = 0;
          showTablesError('');
          markDirty();
          rerenderBody();
          ctx.toast(`Template "${preset.label}" loaded. Save to create the chart.`);
          return;
        }

        if (button.dataset.removeRow !== undefined) {
          const index = Number(button.dataset.removeRow);
          if (table().rows.length <= 1) {
            ctx.toast('A table needs at least one row.', 'critical');
            return;
          }
          table().rows.splice(index, 1);
          showTablesError('');
          markDirty();
          rerenderBody();
          return;
        }

        if (button.dataset.removeCol !== undefined) {
          const index = Number(button.dataset.removeCol);
          if (table().columns.length <= 1) {
            ctx.toast('A table needs at least one column.', 'critical');
            return;
          }
          removeColumn(index);
          showTablesError('');
          markDirty();
          rerenderBody();
          return;
        }

        if (button.dataset.removeTable !== undefined) {
          if (chart.tables.length <= 1) {
            ctx.toast('A chart needs at least one table.', 'critical');
            return;
          }
          chart.tables.splice(activeTable, 1);
          for (const translation of Object.values(chart.translations ?? {})) {
            if (Array.isArray(translation.tables)) translation.tables.splice(activeTable, 1);
          }
          activeTable = Math.max(0, activeTable - 1);
          showTablesError('');
          markDirty();
          rerenderBody();
          return;
        }

        switch (button.dataset.action) {
          case 'add-row': {
            table().rows.push(table().columns.map((_, index) => (index === 0 ? '' : '')));
            showTablesError('');
            markDirty();
            rerenderBody();
            return;
          }
          case 'add-col': {
            addColumn();
            showTablesError('');
            markDirty();
            rerenderBody();
            return;
          }
          case 'add-table': {
            chart.tables.push({
              ...EMPTY_TABLE,
              name: `Table ${chart.tables.length + 1}`,
              columns: [...EMPTY_TABLE.columns],
              rows: [
                ['S', '', ''],
                ['M', '', ''],
                ['L', '', ''],
              ],
              units: { ...EMPTY_TABLE.units },
            });
            for (const translation of Object.values(chart.translations ?? {})) {
              translation.tables ??= [];
              translation.tables.push({ name: '', columns: {} });
            }
            activeTable = chart.tables.length - 1;
            showTablesError('');
            markDirty();
            rerenderBody();
            return;
          }
          case 'import-csv': {
            root.querySelector('#csv-input')?.click();
            return;
          }
          case 'export-csv': {
            exportCsv();
            return;
          }
          case 'export-json': {
            download(`${fileBase()}.json`, JSON.stringify(chart, null, 2), 'application/json');
            return;
          }
          case 'discard': {
            hideSaveBar(SAVE_BAR_ID);
            await ctx.rerender();
            return;
          }
          case 'save': {
            await save(button);
            return;
          }
          case 'duplicate': {
            button.disabled = true;
            try {
              const id = await duplicateChart(chartId);
              await publishChartsIndex();
              await ctx.refresh();
              ctx.toast('Chart duplicated.');
              ctx.navigate(`/charts/${id.split('/').pop()}`);
            } catch (error) {
              button.disabled = false;
              ctx.toast(error instanceof Error ? error.message : 'Could not duplicate.', 'critical');
            }
            return;
          }
          case 'delete': {
            const ok = await ctx.confirm({
              title: `Delete "${chart.name || 'this chart'}"?`,
              message: 'Assignment rules that used this chart are removed. This cannot be undone.',
              confirmLabel: 'Delete chart',
              tone: 'critical',
            });
            if (!ok) return;
            try {
              await deleteChart(chartId);
              await publishChartsIndex();
              await ctx.refresh();
              ctx.toast('Chart deleted.');
              ctx.navigate('/charts');
            } catch (error) {
              ctx.toast(error instanceof Error ? error.message : 'Could not delete.', 'critical');
            }
          }
        }
      });

      async function save(button) {
        if (!chart.name.trim()) {
          showNameError('Enter a chart name before saving.');
          root.querySelector('[data-field="name"]')?.focus();
          return;
        }
        if (chart.tables.length === 0 || chart.tables.some((item) => item.columns.length === 0)) {
          showTablesError('Every table needs at least one column.');
          return;
        }

        button.disabled = true;
        button.textContent = 'Saving…';
        try {
          if (isNewChart()) {
            const id = await createChart(chart);
            await publishChartsIndex();
            await ctx.refresh();
            markClean();
            ctx.toast('Chart created and published to your storefront.');
            ctx.navigate(`/charts/${id.split('/').pop()}`);
            return;
          }
          await updateChart(chartId, chart);
          await publishChartsIndex();
          await ctx.refresh();
          markClean();
          ctx.toast('Saved. Your storefront chart is up to date.');
        } catch (error) {
          ctx.toast(error instanceof Error ? error.message : 'Could not save the chart.', 'critical');
        } finally {
          button.disabled = false;
          button.textContent = 'Save chart';
        }
      }

      function table() {
        return chart.tables[activeTable] ?? chart.tables[0];
      }

      function addColumn() {
        const current = table();
        let index = current.columns.length;
        let name = `Measurement ${index}`;
        while (current.columns.includes(name)) name += "'";
        current.columns.push(name);
        current.rows.forEach((row) => row.push(''));
        current.units[name] = 'cm';
      }

      function removeColumn(index) {
        const current = table();
        const [name] = current.columns.splice(index, 1);
        if (name && name in current.units) delete current.units[name];
        current.rows.forEach((row) => row.splice(index, 1));
      }

      function renameColumn(index, name) {
        const current = table();
        const oldName = current.columns[index];
        if (!oldName) return;
        current.columns[index] = name;
        if (oldName in current.units) {
          current.units[name] = current.units[oldName];
          delete current.units[oldName];
        }
      }

      function importCsv(file) {
        const reader = new FileReader();
        reader.onload = () => {
          const lines = String(reader.result ?? '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
          if (lines.length < 2) {
            showTablesError('The CSV needs a header row and at least one data row.');
            return;
          }
          const columns = lines[0].split(',').map((value) => value.trim());
          const rows = lines.slice(1).map((line) => line.split(',').map((value) => value.trim()));
          const units = {};
          columns.forEach((column, index) => {
            if (index === 0) return;
            if (SIZE_SYSTEMS.includes(column.toUpperCase())) return;
            const sample = rows.map((row) => row[index]).find(Boolean) ?? '';
            units[column] = /^\d/.test(sample) ? 'cm' : '';
          });
          chart.tables[activeTable] = { name: chart.tables[activeTable].name, columns, rows, units };
          showTablesError('');
          markDirty();
          rerenderBody();
          ctx.toast(`Imported ${rows.length} rows into this table.`);
        };
        reader.readAsText(file);
      }

      function exportCsv() {
        const lines = chart.tables.map((current) => {
          const header = current.columns.join(',');
          const rows = current.rows.map((row) => row.join(',')).join('\n');
          return `# ${current.name}\n${header}\n${rows}`;
        });
        download(`${fileBase()}.csv`, lines.join('\n\n'), 'text/csv');
      }

      function fileBase() {
        return (chart.name || 'size-chart').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }

      updateMeasurePreview();
    },
  };

  function bodyMarkup(currentChart, active, showPresets) {
    const table = currentChart.tables[active] ?? currentChart.tables[0];

    return `
      ${showPresets ? presetSection() : ''}
      <div class="columns">
        <div class="stack">
          <s-section>
            <h2 class="panel-title mb-8">Chart details</h2>
            <div class="field-row">
              <div class="field">
                <label for="chart-name">Chart name</label>
                <input id="chart-name" type="text" data-field="name" value="${esc(currentChart.name)}" placeholder="e.g. Men's T-Shirt Size Guide" />
                <p class="field-error hidden" id="name-error" role="alert"></p>
                <span class="hint">Shown as the title inside the size guide.</span>
              </div>
              <div class="field">
                <label for="chart-unit">Default unit</label>
                <select id="chart-unit" data-default-unit>
                  ${['cm', 'in', 'mm'].map((unit) => `<option value="${unit}" ${currentChart.default_unit === unit ? 'selected' : ''}>${unit === 'cm' ? 'Centimetres (cm)' : unit === 'in' ? 'Inches (in)' : 'Millimetres (mm)'}</option>`).join('')}
                </select>
                <span class="hint">Customers can still switch cm ↔ inches on the storefront.</span>
              </div>
            </div>

            <div class="field">
              <label>Size systems in this chart</label>
              <div class="check-row">
                ${SIZE_SYSTEMS.map((system) => `<label class="check"><input type="checkbox" data-system="${system}" ${currentChart.size_systems.includes(system) ? 'checked' : ''} /> ${system}</label>`).join('')}
              </div>
              <span class="hint">Ticked systems are used for the storefront size-system switch. Columns named US / EU / UK are detected automatically.</span>
            </div>

            <div class="field">
              <label for="fit-notes">Fit notes</label>
              <textarea id="fit-notes" data-field="fit_notes" placeholder="e.g. Relaxed fit — size up if you are between sizes.">${esc(currentChart.fit_notes)}</textarea>
              <span class="hint">Short advice shown under the chart.</span>
            </div>

            <div class="field">
              <label for="measure-instructions">How to measure</label>
              <textarea id="measure-instructions" data-field="measure_instructions" placeholder="e.g. Measure around the fullest part of the chest, keeping the tape level.">${esc(currentChart.measure_instructions)}</textarea>
              <span class="hint">Optional. Shown above the Find my size calculator.</span>
            </div>

            <div class="field">
              <label for="measure-diagram">Built-in measuring diagram</label>
              <select id="measure-diagram">
                <option value="">No diagram</option>
                ${MEASURE_DIAGRAMS.map((diagram) => `<option value="${esc(diagram.file)}">${esc(diagram.label)}</option>`).join('')}
                <option value="__custom">Custom image URL</option>
              </select>
              <span class="hint">Shows customers exactly where to measure. The diagram appears above the instructions.</span>
            </div>

            <div class="field">
              <label for="measure-image">Custom image URL</label>
              <input id="measure-image" type="url" data-field="measure_image" value="${esc(currentChart.measure_image)}" placeholder="https://cdn.shopify.com/…" />
              <span class="hint">Optional. Use your own photo instead of a built-in diagram.</span>
              <div class="measure-preview hidden" id="measure-preview"></div>
            </div>
          </s-section>

          <s-section>
            <div class="row-between mb-8">
              <div>
                <h2 class="panel-title">Size tables</h2>
                <p class="muted small mt-0">Each table becomes a tab in the size guide. Use ranges like <span class="kbd">86-91</span> when a size covers a span.</p>
                <p class="field-error hidden" id="tables-error" role="alert"></p>
              </div>
              <button class="btn btn-sm" data-action="add-table">${icon('plus', 14)} Add table</button>
            </div>

            ${currentChart.tables.length > 1
              ? `<div class="tab-bar">
                  ${currentChart.tables.map((item, index) => `<button class="tab ${index === active ? 'active' : ''}" data-tab="${index}">${esc(item.name || `Table ${index + 1}`)}</button>`).join('')}
                </div>`
              : ''}

            <div class="field">
              <label for="table-name">Table name</label>
              <input id="table-name" type="text" data-table-name value="${esc(table?.name ?? '')}" placeholder="e.g. Men" />
            </div>

            <div class="field-row">
              <div class="field">
                <label for="table-variant-option">Show for variant option</label>
                <input id="table-variant-option" type="text" data-table-variant-option value="${esc(table?.variant?.option ?? '')}" placeholder="e.g. Color" />
              </div>
              <div class="field">
                <label for="table-variant-value">Option value</label>
                <input id="table-variant-value" type="text" data-table-variant-value value="${esc(table?.variant?.value ?? '')}" placeholder="e.g. Black" />
              </div>
            </div>
            <span class="hint">Optional. When a shopper selects this variant, this table opens automatically. Leave both blank to show the table always.</span>

            ${table ? tableMarkup(table) : ''}

            ${table ? heightWeightMarkup(table) : ''}

            <div class="row mt-8">
              <button class="btn btn-sm" data-action="add-row">${icon('plus', 14)} Add row</button>
              <button class="btn btn-sm" data-action="add-col">${icon('plus', 14)} Add column</button>
              <button class="btn btn-sm" data-action="import-csv">Import CSV</button>
              <button class="btn btn-sm" data-action="export-csv">Export CSV</button>
              ${currentChart.tables.length > 1 ? '<button class="btn btn-sm btn-critical" data-remove-table>Remove this table</button>' : ''}
              <input type="file" id="csv-input" accept=".csv,text/csv" class="hidden" />
            </div>
            <p class="hint mt-8">CSV format: first row is the header (Size, Chest, Waist…), following rows are measurements. Import replaces the current table.</p>
          </s-section>

          ${translationSection(currentChart)}

          ${!isNewChart()
            ? `<s-section>
                <h2 class="panel-title mb-8">Danger zone</h2>
                <p class="muted small mt-0">Deleting removes the chart and any assignment rules that use it.</p>
                <button class="btn btn-critical" data-action="delete">${icon('trash', 16)} Delete chart</button>
              </s-section>`
            : ''}
        </div>

        <aside class="rail">
          <div class="card">
            <h3>Where this chart is used</h3>
            <ul>
              <li>Assign it to products in <a class="link" href="/assign" data-link>Assignment</a>.</li>
              <li>The theme needs the <strong>Size Chart</strong> block or <strong>Size Chart Float</strong> embed enabled.</li>
              <li>If two charts apply, the product override wins, then the first matching rule.</li>
            </ul>
          </div>
          <div class="card">
            <h3>Find my size</h3>
            <p class="small muted mt-0">The calculator appears when the chart has at least one measurement column (Chest, Waist, Foot Length…). Size, US, EU and UK columns are treated as labels. Add a height & weight guide to a table for a second finder based on height and weight ranges.</p>
          </div>
          <div class="card">
            <h3>This chart</h3>
            <p class="small muted mt-0">${currentChart.tables.length} ${plural(currentChart.tables.length, 'table')} · ${table ? table.columns.length : 0} columns · ${table ? table.rows.length : 0} rows</p>
          </div>
        </aside>
      </div>
    `;
  }

  function presetSection() {
    return `<s-section class="mb-16">
      <div class="row-between mb-8">
        <div>
          <h2 class="panel-title">Start from a product category</h2>
          <p class="muted small mt-0">Pick a category to fill the form with sizes, measurement columns, fit notes and measuring tips. Nothing is saved until you click <strong>Save chart</strong>, and every cell stays editable.</p>
        </div>
        <span class="badge badge-accent">${PRESET_COUNT} categories</span>
      </div>
      ${presetPickerMarkup()}
    </s-section>`;
  }

  function tableMarkup(table) {
    return `
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              ${table.columns.map((column, index) => `
                <th>
                  <input class="col-head-input" type="text" data-header="${index}" value="${esc(column)}" aria-label="Column ${index + 1} name" />
                  ${index > 0 ? `<div class="col-unit-row">
                    <select data-unit-col="${index}" aria-label="Unit for ${esc(column)}">
                      ${UNIT_OPTIONS.map((unit) => `<option value="${unit}" ${(table.units[column] ?? '') === unit ? 'selected' : ''}>${unit || 'no unit'}</option>`).join('')}
                    </select>
                    <button class="btn btn-icon" data-remove-col="${index}" title="Remove column" aria-label="Remove column">${icon('trash', 13)}</button>
                  </div>` : `<div class="col-unit-row"><span class="hint">label</span></div>`}
                </th>`).join('')}
              <th style="width:36px"></th>
            </tr>
          </thead>
          <tbody>
            ${table.rows.map((row, rowIndex) => `
              <tr>
                ${table.columns.map((_, columnIndex) => `
                  <td>
                    <input class="cell-input" type="text" data-cell="${rowIndex}:${columnIndex}" value="${esc(row[columnIndex] ?? '')}" aria-label="Row ${rowIndex + 1}, ${esc(table.columns[columnIndex])}" />
                  </td>`).join('')}
                <td>
                  <button class="btn btn-icon" data-remove-row="${rowIndex}" title="Remove row" aria-label="Remove row">${icon('trash', 14)}</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}
