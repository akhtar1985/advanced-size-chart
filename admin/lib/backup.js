import {
  listCharts,
  fetchChart,
  createChart,
  updateChart,
  publishChartsIndex,
  fetchRules,
  saveRules,
  fetchSettings,
  saveSettings,
  fetchOverrides,
  setProductOverride,
  saveOverrideEntry,
} from './sizeChart.js';

const FORMAT = 'advanced-size-chart-backup';
const VERSION = 1;

export async function buildBackup(shop = '') {
  const summaries = await listCharts();
  const charts = [];
  for (const summary of summaries) {
    const chart = await fetchChart(summary.id);
    charts.push({ id: summary.id, ...chart });
  }
  const [rules, settings, overrides] = await Promise.all([fetchRules(), fetchSettings(), fetchOverrides()]);
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    shop,
    charts,
    rules,
    settings,
    overrides,
  };
}

export function validateBackup(bundle) {
  if (!bundle || typeof bundle !== 'object' || bundle.format !== FORMAT) {
    throw new Error('This file is not an Advanced Size Chart backup.');
  }
  if (!Array.isArray(bundle.charts) || bundle.charts.length === 0) {
    throw new Error('The backup contains no size charts.');
  }
  return bundle;
}

export async function importBackup(bundle) {
  validateBackup(bundle);
  const existing = new Set((await listCharts()).map((chart) => chart.id));
  const idMap = new Map();
  let created = 0;
  let updated = 0;

  for (const entry of bundle.charts) {
    if (!entry || typeof entry !== 'object') continue;
    const { id, ...chart } = entry;
    if (!String(chart.name ?? '').trim()) continue;
    if (id && existing.has(id)) {
      await updateChart(id, chart);
      idMap.set(id, id);
      updated += 1;
    } else {
      const newId = await createChart(chart);
      if (id) idMap.set(id, newId);
      created += 1;
    }
  }

  let ruleCount = 0;
  if (Array.isArray(bundle.rules)) {
    const rules = bundle.rules
      .map((rule) => (rule && idMap.has(rule.chartId) ? { ...rule, chartId: idMap.get(rule.chartId) } : null))
      .filter(Boolean);
    await saveRules(rules);
    ruleCount = rules.length;
  }

  if (bundle.settings && typeof bundle.settings === 'object') {
    await saveSettings(bundle.settings);
  }

  let overrideCount = 0;
  for (const entry of Array.isArray(bundle.overrides) ? bundle.overrides : []) {
    const chartId = entry && idMap.get(entry.chartId);
    if (!entry?.productId || !chartId) continue;
    await setProductOverride(entry.productId, chartId);
    await saveOverrideEntry({
      productId: entry.productId,
      title: entry.title ?? '',
      handle: entry.handle ?? '',
      chartId,
    });
    overrideCount += 1;
  }

  await publishChartsIndex();
  return { charts: bundle.charts.length, created, updated, rules: ruleCount, overrides: overrideCount };
}
