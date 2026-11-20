import { PRESET_COUNT, PRESETS } from '../lib/presets.js';
import { presetPickerMarkup, bindPresetPicker } from '../lib/presetPicker.js';
import { createChart, duplicateChart, deleteChart, publishChartsIndex, createRuleId, saveRules } from '../lib/sizeChart.js';
import { themeEditorUrl } from '../lib/billing.js';
import { esc, icon, formatDate, plural } from '../ui.js';

export async function render(ctx) {
  let created = null;
  let creating = false;

  return {
    heading: 'Size charts',
    html: `
      <div class="row-between mb-16">
        <p class="page-intro mt-0">A chart is a reusable set of tables. Start from a product category below, then choose where it appears in <a class="link" href="/assign" data-link>Assignment</a>.</p>
        <a class="btn btn-primary" href="/charts/new" data-link>${icon('plus', 16)} New size chart</a>
      </div>

      <s-section class="mb-16">
        <div class="row-between mb-8">
          <div>
            <h2 class="panel-title">Start from a product category</h2>
            <p class="muted small mt-0">Pick the item you sell — T-shirt, jeans, watch, sunglasses and more. A chart is created immediately with sizes, measurement columns, fit notes and measuring tips already filled in; every cell can still be edited.</p>
          </div>
          <span class="badge badge-accent">${PRESET_COUNT} categories</span>
        </div>
        <div id="preset-picker-wrap">${presetPickerMarkup()}</div>
      </s-section>

      <div id="charts-panel">${chartsPanelMarkup(ctx.state.charts)}</div>
    `,
    mount(root) {
      bindPresetPicker(root);

      const presetWrap = root.querySelector('#preset-picker-wrap');
      const chartsPanel = root.querySelector('#charts-panel');

      const showSuccess = () => {
        if (!presetWrap || !created) return;
        presetWrap.innerHTML = createdMarkup(created, ctx.state.rules.length);
        presetWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };

      presetWrap?.addEventListener('click', async (event) => {
        if (event.target.closest?.('[data-new-template]')) {
          created = null;
          presetWrap.innerHTML = presetPickerMarkup();
          presetWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }

        const presetButton = event.target.closest?.('[data-preset]');
        if (presetButton) {
          const preset = PRESETS[Number(presetButton.dataset.preset)];
          if (!preset || creating) return;
          creating = true;
          const desc = presetButton.querySelector('.preset-desc');
          presetButton.disabled = true;
          if (desc) desc.textContent = 'Creating chart…';
          try {
            const chart = JSON.parse(JSON.stringify(preset.chart));
            chart.fit_notes ??= '';
            chart.measure_instructions ??= '';
            chart.measure_image ??= '';
            const id = await createChart(chart);
            await publishChartsIndex();
            await ctx.refresh();
            created = { id, label: preset.label, chartName: chart.name, summary: chartSummary(chart), assigned: false };
            refreshChartsPanel();
            showSuccess();
            ctx.toast(`"${preset.label}" chart created. Choose where it should appear.`);
          } catch (error) {
            presetButton.disabled = false;
            if (desc) desc.textContent = preset.description;
            ctx.toast(error instanceof Error ? error.message : 'Could not create the chart.', 'critical');
          } finally {
            creating = false;
          }
          return;
        }

        const quickAssign = event.target.closest?.('[data-quick-assign]');
        if (quickAssign && created) {
          quickAssign.disabled = true;
          quickAssign.textContent = 'Assigning…';
          try {
            await saveRules([...ctx.state.rules, { id: createRuleId(), match: { type: 'all', value: '' }, chartId: created.id }]);
            await ctx.refresh();
            created.assigned = true;
            showSuccess();
            ctx.toast('Rule saved — this chart now applies to all products. Add the theme block to display it.');
          } catch (error) {
            quickAssign.disabled = false;
            quickAssign.textContent = 'Show it on all products';
            ctx.toast(error instanceof Error ? error.message : 'Could not save the rule.', 'critical');
          }
        }
      });

      function refreshChartsPanel() {
        if (!chartsPanel) return;
        chartsPanel.innerHTML = chartsPanelMarkup(ctx.state.charts);
        bindChartSearch();
      }

      function bindChartSearch() {
        const search = chartsPanel?.querySelector('#chart-search');
        search?.addEventListener('input', () => {
          const term = search.value.trim().toLowerCase();
          chartsPanel.querySelectorAll('#chart-list .chart-card').forEach((card) => {
            card.classList.toggle('hidden', Boolean(term) && !card.dataset.name.includes(term));
          });
        });
      }

      chartsPanel?.addEventListener('click', async (event) => {
        const duplicate = event.target.closest?.('[data-duplicate]');
        if (duplicate) {
          duplicate.disabled = true;
          try {
            await duplicateChart(duplicate.dataset.duplicate);
            await publishChartsIndex();
            await ctx.refresh();
            ctx.toast('Chart duplicated.');
            refreshChartsPanel();
          } catch (error) {
            duplicate.disabled = false;
            ctx.toast(error instanceof Error ? error.message : 'Could not duplicate the chart.', 'critical');
          }
          return;
        }

        const remove = event.target.closest?.('[data-delete]');
        if (remove) {
          const card = remove.closest('.chart-card');
          const name = card?.querySelector('.chart-name')?.textContent ?? 'this chart';
          const ok = await ctx.confirm({
            title: `Delete ${name}?`,
            message: 'Rules that pointed to this chart are removed too. The chart cannot be restored.',
            confirmLabel: 'Delete chart',
            tone: 'critical',
          });
          if (!ok) return;
          remove.disabled = true;
          try {
            await deleteChart(remove.dataset.delete);
            await publishChartsIndex();
            await ctx.refresh();
            ctx.toast('Chart deleted.');
            refreshChartsPanel();
          } catch (error) {
            remove.disabled = false;
            ctx.toast(error instanceof Error ? error.message : 'Could not delete the chart.', 'critical');
          }
        }
      });

      bindChartSearch();
    },
  };
}

function chartSummary(chart) {
  const tables = chart.tables ?? [];
  const columns = tables[0]?.columns?.length ?? 0;
  const sizes = tables.reduce((total, table) => total + (table.rows?.length ?? 0), 0);
  const systems = chart.size_systems?.length ? ` · ${chart.size_systems.join('/')} sizes` : '';
  return `${tables.length} ${plural(tables.length, 'table')} · ${columns} ${plural(columns, 'column')} · ${sizes} ${plural(sizes, 'row')}${systems}`;
}

function createdMarkup(created, ruleCount) {
  return `
    <div class="preset-success">
      <div class="preset-success-icon">${icon('check', 20)}</div>
      <div class="preset-success-body">
        <h3>${esc(created.chartName)} is created</h3>
        <p class="muted small mt-0">Already filled with <strong>${esc(created.summary)}</strong>, fit notes and measuring tips. Every cell can be edited.</p>
        <div class="row">
          ${created.assigned
            ? `<span class="badge badge-success"><span class="dot"></span>Applies to all products</span>
               <a class="btn" href="/assign" data-link>Review assignment</a>`
            : ruleCount === 0
              ? '<button class="btn btn-primary" type="button" data-quick-assign>Show it on all products</button>'
              : '<a class="btn btn-primary" href="/assign" data-link>Assign this chart</a>'}
          <a class="btn" href="/charts/${esc(created.id.split('/').pop())}" data-link>Review & edit data</a>
          <button class="btn btn-ghost" type="button" data-new-template>Create another</button>
        </div>
        <div class="callout mt-16">
          <strong>Last step: turn on the theme button</strong>
          <p>Add the <strong>Size Chart</strong> app block to your product template, or enable the floating <strong>Size Chart Float</strong> app embed. <a class="link" href="/help" data-link>Step-by-step theme setup</a></p>
          <a class="btn btn-sm" href="${esc(themeEditorUrl('block'))}" target="_top">Open theme editor</a>
        </div>
      </div>
    </div>`;
}

function chartsPanelMarkup(charts) {
  return `
    <s-section>
      <div class="row-between mb-8">
        <div>
          <h2 class="panel-title">Your charts</h2>
          <p class="muted small mt-0">${charts.length} ${plural(charts.length, 'chart')} saved in this store.</p>
        </div>
        ${charts.length > 3 ? '<input type="search" id="chart-search" placeholder="Search charts" style="max-width:220px" />' : ''}
      </div>

      ${charts.length === 0
        ? `<div class="empty">
            <div class="stat-icon" style="margin:0 auto">${icon('chart')}</div>
            <h3>No charts yet</h3>
            <p>Choose a product category above and a filled chart is ready in one click, or create a blank chart.</p>
            <a class="btn btn-primary" href="/charts/new" data-link>Create a blank chart</a>
          </div>`
        : `<div class="chart-grid" id="chart-list">
            ${charts.map((chart) => `
              <div class="chart-card" data-name="${esc(chart.name.toLowerCase())}" data-id="${esc(chart.id)}">
                <div class="chart-card-top">
                  <div>
                    <div class="chart-name">${esc(chart.name || 'Untitled chart')}</div>
                    <div class="chart-meta">Default unit: ${esc(chart.default_unit)} · ${chart.tables} ${plural(chart.tables, 'table')}</div>
                    <div class="chart-meta">Updated ${esc(formatDate(chart.updatedAt))}</div>
                  </div>
                </div>
                <div class="chart-card-actions">
                  <a class="btn btn-sm" href="/charts/${chart.id.split('/').pop()}" data-link>Edit</a>
                  <button class="btn btn-sm" data-duplicate="${esc(chart.id)}">Duplicate</button>
                  <button class="btn btn-sm btn-icon" data-delete="${esc(chart.id)}" title="Delete chart" aria-label="Delete chart">${icon('trash', 16)}</button>
                </div>
              </div>`).join('')}
          </div>`}
    </s-section>`;
}
