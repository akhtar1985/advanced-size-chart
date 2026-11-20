export interface SizeChartTable {
  name: string;
  columns: string[];
  rows: (string | number)[][];
  units: Record<string, string>;
  sizeSystemColumns?: Record<string, string>;
}

export interface SizeChart {
  name: string;
  default_unit: string;
  size_systems: string[];
  tables: SizeChartTable[];
  fit_notes: string;
  measure_image?: string;
}

export type SizeChartSummary = { id: string; name: string; default_unit: string };

export const EMPTY_TABLE: SizeChartTable = {
  name: 'Table 1',
  columns: ['Size', 'Chest', 'Waist'],
  rows: [['S', 86, 71], ['M', 91, 76], ['L', 97, 81], ['XL', 102, 86]],
  units: { Chest: 'cm', Waist: 'cm' },
};

export const EMPTY_CHART: SizeChart = {
  name: '',
  default_unit: 'cm',
  size_systems: ['US'],
  tables: [{ ...EMPTY_TABLE }],
  fit_notes: '',
};

const primedCharts = new Map<string, SizeChart>();

export function primeChart(id: string, chart: SizeChart) {
  primedCharts.set(id, { ...chart });
}

export function getPrimedChart(id: string): SizeChart | null {
  return primedCharts.get(id) ?? null;
}

function gqlFetch(query: string, variables?: Record<string, unknown>) {
  return fetch('shopify:admin/api/2026-07/graphql.json', {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  }).then(r => r.json());
}

function fromFields(fields: { key: string; value: string }[]): SizeChart {
  const map: Record<string, string> = {};
  for (const f of fields) map[f.key] = f.value;
  return {
    name: map.name ?? '',
    default_unit: map.default_unit ?? 'cm',
    size_systems: map.size_systems ? JSON.parse(map.size_systems) : ['US'],
    tables: map.tables ? JSON.parse(map.tables) : [],
    fit_notes: map.fit_notes ?? '',
    measure_image: map.measure_image ?? '',
  };
}

export async function listCharts(): Promise<SizeChartSummary[]> {
  const json = await gqlFetch(`#graphql
    query ListCharts {
      metaobjects(type: "$app:size_chart", first: 50, sortKey: "updated_at", reverse: true) {
        edges {
          node {
            id
            fields { key value }
          }
        }
      }
    }`);
  return (json.data?.metaobjects?.edges ?? []).map(({ node }: any) => {
    const chart = fromFields(node.fields);
    primeChart(node.id, chart);
    return { id: node.id, name: chart.name, default_unit: chart.default_unit };
  });
}

export async function fetchChart(id: string): Promise<SizeChart> {
  const json = await gqlFetch(`#graphql
    query GetChart($id: ID!) {
      metaobject(id: $id) { fields { key value } }
    }`, { id });
  const chart = fromFields(json.data.metaobject.fields);
  primeChart(id, chart);
  return chart;
}

function toFields(chart: SizeChart) {
  return [
    { key: 'name', value: chart.name },
    { key: 'default_unit', value: chart.default_unit },
    { key: 'size_systems', value: JSON.stringify(chart.size_systems) },
    { key: 'tables', value: JSON.stringify(chart.tables) },
    { key: 'fit_notes', value: chart.fit_notes },
  ];
}

export async function createChart(chart: SizeChart): Promise<string> {
  const json = await gqlFetch(`#graphql
    mutation CreateChart($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }`, { metaobject: { type: '$app:size_chart', fields: toFields(chart) } });
  return json.data.metaobjectCreate.metaobject.id;
}

export async function updateChart(id: string, chart: SizeChart): Promise<void> {
  await gqlFetch(`#graphql
    mutation UpdateChart($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }`, { id, metaobject: { fields: toFields(chart) } });
  primeChart(id, chart);
}

export async function deleteChart(id: string): Promise<void> {
  await gqlFetch(`#graphql
    mutation DeleteChart($id: ID!) {
      metaobjectDelete(id: $id) { deletedId }
    }`, { id });
}

export async function duplicateChart(id: string): Promise<string> {
  const chart = await fetchChart(id);
  chart.name = `${chart.name} (copy)`;
  return createChart(chart);
}

// ── Rules & Settings (shop metafields) ────────────────────────────────────────

export interface Rule {
  id: string;
  priority: number;
  match: { type: string; value: string };
  chartId: string;
}

export interface AppSettings {
  displayMode: string;
  defaultUnit: string;
  buttonText: string;
  primaryColor: string;
  borderRadius: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  displayMode: 'modal',
  defaultUnit: 'cm',
  buttonText: 'Size Guide',
  primaryColor: '#000000',
  borderRadius: '4px',
};

async function fetchShopMetafield(key: string): Promise<string | null> {
  const json = await gqlFetch(`#graphql
    query ShopMeta($key: String!, $ns: String!) {
      shop { metafield(namespace: $ns, key: $key) { value } }
    }`, { key, ns: '$app' });
  return json.data?.shop?.metafield?.value ?? null;
}

async function setShopMetafield(key: string, value: string): Promise<void> {
  await gqlFetch(`#graphql
    mutation SetShopMeta($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { userErrors { field message } }
    }`, {
    metafields: [{
      ownerId: 'gid://shopify/Shop/current',
      namespace: '$app',
      key,
      type: 'json',
      value,
    }],
  });
}

export async function fetchRules(): Promise<Rule[]> {
  const val = await fetchShopMetafield('rules');
  return val ? JSON.parse(val) : [];
}

export async function saveRules(rules: Rule[]): Promise<void> {
  await setShopMetafield('rules', JSON.stringify(rules));
}

export async function fetchSettings(): Promise<AppSettings> {
  const val = await fetchShopMetafield('settings');
  return val ? { ...DEFAULT_SETTINGS, ...JSON.parse(val) } : { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setShopMetafield('settings', JSON.stringify(settings));
}
