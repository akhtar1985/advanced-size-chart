const API_VERSION = '2026-10';

export const SIZE_SYSTEMS = ['US', 'EU', 'UK', 'IN', 'AU', 'JP', 'IT', 'FR'];

export const EMPTY_TABLE = {
  name: 'Table 1',
  columns: ['Size', 'Chest', 'Waist'],
  rows: [
    ['S', '86-91', '71-76'],
    ['M', '91-97', '76-81'],
    ['L', '97-102', '81-86'],
    ['XL', '102-107', '86-91'],
  ],
  units: { Chest: 'cm', Waist: 'cm' },
};

export function emptyChart() {
  return {
    name: '',
    default_unit: 'cm',
    size_systems: ['US', 'EU', 'UK'],
    tables: [{ ...EMPTY_TABLE, columns: [...EMPTY_TABLE.columns], rows: EMPTY_TABLE.rows.map((row) => [...row]), units: { ...EMPTY_TABLE.units } }],
    fit_notes: '',
    measure_instructions: '',
    measure_image: '',
    translations: {},
  };
}

// ── Transport ────────────────────────────────────────────────────────────────

export async function gqlFetch(query, variables) {
  const response = await fetch(`shopify:admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    throw new Error(body.errors.map((error) => error.message).join('; '));
  }
  return body.data;
}

function throwUserErrors(errors) {
  if (errors && errors.length > 0) throw new Error(errors.map((error) => error.message).join('; '));
}

function parseJSON(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// ── Chart parsing ────────────────────────────────────────────────────────────

function normalizeHeightWeight(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.rows)) return null;
  const rows = input.rows
    .filter((row) => row && typeof row === 'object')
    .map((row) => ({
      size: String(row.size ?? ''),
      heightMin: String(row.heightMin ?? ''),
      heightMax: String(row.heightMax ?? ''),
      weightMin: String(row.weightMin ?? ''),
      weightMax: String(row.weightMax ?? ''),
    }));
  if (rows.length === 0) return null;
  return {
    heightUnit: input.heightUnit === 'in' ? 'in' : 'cm',
    weightUnit: input.weightUnit === 'lb' ? 'lb' : 'kg',
    rows,
  };
}

function normalizeTable(input) {
  const columns = Array.isArray(input.columns) ? input.columns.map(String) : [];
  const rows = Array.isArray(input.rows)
    ? input.rows.map((row) => (Array.isArray(row) ? row.map((cell) => (typeof cell === 'number' ? cell : String(cell ?? ''))) : []))
    : [];
  const units = {};
  for (const [column, unit] of Object.entries(input.units ?? {})) {
    if (columns.includes(column) && typeof unit === 'string') units[column] = unit;
  }
  const variantOption = String(input.variant?.option ?? '').trim();
  const variantValue = String(input.variant?.value ?? '').trim();
  const heightWeight = normalizeHeightWeight(input.heightWeight);
  return {
    name: String(input.name ?? ''),
    columns,
    rows,
    units,
    ...(input.sizeSystemColumns && typeof input.sizeSystemColumns === 'object' ? { sizeSystemColumns: input.sizeSystemColumns } : {}),
    ...(variantOption && variantValue ? { variant: { option: variantOption, value: variantValue } } : {}),
    ...(heightWeight ? { heightWeight } : {}),
  };
}

function fromFields(fields) {
  const map = {};
  for (const field of fields ?? []) map[field.key] = field.value;

  return {
    name: map.name ?? '',
    default_unit: map.default_unit || 'cm',
    size_systems: parseJSON(map.size_systems, ['US']).map(String),
    tables: parseJSON(map.tables, []).map(normalizeTable),
    fit_notes: map.fit_notes ?? '',
    measure_instructions: map.measure_instructions ?? '',
    measure_image: map.measure_image ?? '',
    translations: parseJSON(map.translations, {}),
  };
}

function toFields(chart) {
  return [
    { key: 'name', value: chart.name.trim() },
    { key: 'default_unit', value: ['cm', 'in', 'mm'].includes(chart.default_unit) ? chart.default_unit : 'cm' },
    { key: 'size_systems', value: JSON.stringify(chart.size_systems) },
    { key: 'tables', value: JSON.stringify(chart.tables) },
    { key: 'fit_notes', value: chart.fit_notes },
    { key: 'measure_instructions', value: chart.measure_instructions },
    { key: 'measure_image', value: chart.measure_image },
    { key: 'translations', value: JSON.stringify(chart.translations ?? {}) },
  ];
}

const primedCharts = new Map();

export function primeChart(id, chart) {
  primedCharts.set(id, cloneChart(chart));
}

export function getPrimedChart(id) {
  const chart = primedCharts.get(id);
  return chart ? cloneChart(chart) : null;
}

function cloneChart(chart) {
  return {
    ...chart,
    tables: chart.tables.map((table) => ({
      ...table,
      columns: [...table.columns],
      rows: table.rows.map((row) => [...row]),
      units: { ...table.units },
    })),
  };
}

// ── Chart CRUD ───────────────────────────────────────────────────────────────

const CHART_FIELDS = 'id updatedAt fields { key value }';

export async function listCharts() {
  const summaries = [];
  let after = null;

  do {
    const data = await gqlFetch(
      `#graphql
      query ListCharts($after: String) {
        metaobjects(type: "$app:size_chart", first: 50, sortKey: "updated_at", reverse: true, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges { node { ${CHART_FIELDS} } }
        }
      }`,
      { after },
    );

    for (const { node } of data.metaobjects.edges) {
      const chart = fromFields(node.fields);
      primeChart(node.id, chart);
      summaries.push({ id: node.id, name: chart.name, default_unit: chart.default_unit, updatedAt: node.updatedAt, tables: chart.tables.length });
    }
    after = data.metaobjects.pageInfo.hasNextPage ? data.metaobjects.pageInfo.endCursor : null;
  } while (after);

  return summaries;
}

export async function fetchChart(id) {
  const data = await gqlFetch(
    `#graphql
    query GetChart($id: ID!) {
      metaobject(id: $id) { id fields { key value } }
    }`,
    { id },
  );
  if (!data.metaobject) throw new Error('This size chart no longer exists.');
  const chart = fromFields(data.metaobject.fields);
  primeChart(id, chart);
  return chart;
}

export async function createChart(chart) {
  const data = await gqlFetch(
    `#graphql
    mutation CreateChart($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }`,
    { metaobject: { type: '$app:size_chart', fields: toFields(chart) } },
  );
  throwUserErrors(data.metaobjectCreate.userErrors);
  const id = data.metaobjectCreate.metaobject?.id;
  if (!id) throw new Error('Shopify did not return the new chart.');
  primeChart(id, chart);
  return id;
}

export async function updateChart(id, chart) {
  const data = await gqlFetch(
    `#graphql
    mutation UpdateChart($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }`,
    { id, metaobject: { fields: toFields(chart) } },
  );
  throwUserErrors(data.metaobjectUpdate.userErrors);
  primeChart(id, chart);
}

export async function deleteChart(id) {
  const data = await gqlFetch(
    `#graphql
    mutation DeleteChart($id: ID!) {
      metaobjectDelete(id: $id) {
        deletedId
        userErrors { field message }
      }
    }`,
    { id },
  );
  throwUserErrors(data.metaobjectDelete.userErrors);
  primedCharts.delete(id);

  try {
    const rules = await fetchRules();
    const remaining = rules.filter((rule) => rule.chartId !== id);
    if (remaining.length !== rules.length) await saveRules(remaining);
  } catch {
    // A dangling rule is ignored on the storefront; never block deletion.
  }
}

export async function duplicateChart(id) {
  const chart = await fetchChart(id);
  return createChart({ ...chart, name: `${chart.name || 'Untitled'} (copy)` });
}

// ── Storefront index ─────────────────────────────────────────────────────────

function withSizeSystemColumns(table, systems) {
  const derived = { ...(table.sizeSystemColumns ?? {}) };
  for (const system of systems) {
    const column = table.columns.find((name) => {
      const clean = name.trim().toUpperCase();
      return clean === system.toUpperCase() || clean.startsWith(`${system.toUpperCase()} `) || clean.startsWith(`${system.toUpperCase()}-`);
    });
    if (column) derived[system] = column;
  }
  return { ...table, sizeSystemColumns: derived };
}

function toPublished(chart) {
  return {
    name: chart.name,
    defaultUnit: chart.default_unit,
    sizeSystems: chart.size_systems,
    tables: chart.tables.map((table) => withSizeSystemColumns(table, chart.size_systems)),
    fitNotes: chart.fit_notes,
    measureInstructions: chart.measure_instructions,
    measureImage: chart.measure_image,
    translations: chart.translations ?? {},
  };
}

export async function publishChartsIndex() {
  const summaries = await listCharts();
  const index = {};
  for (const summary of summaries) {
    const chart = getPrimedChart(summary.id);
    if (chart) index[summary.id] = toPublished(chart);
  }
  await setShopMetafield('charts_index', index);
}

// ── Shop metafields ──────────────────────────────────────────────────────────

let shopIdPromise = null;

export function fetchShopId() {
  if (!shopIdPromise) {
    shopIdPromise = gqlFetch('#graphql query ShopId { shop { id } }')
      .then((data) => data.shop.id)
      .catch((error) => {
        shopIdPromise = null;
        throw error;
      });
  }
  return shopIdPromise;
}

export async function fetchShopInfo() {
  const data = await gqlFetch('#graphql query ShopInfo { shop { id myshopifyDomain name currencyCode } }');
  return data.shop;
}

export async function readShopMetafield(key) {
  const data = await gqlFetch(
    `#graphql
    query ShopMetafield($key: String!) {
      shop { metafield(namespace: "$app", key: $key) { value } }
    }`,
    { key },
  );
  const raw = data.shop.metafield?.value;
  if (!raw) return null;
  return parseJSON(raw, null);
}

export async function setShopMetafield(key, value, type = 'json') {
  const ownerId = await fetchShopId();
  const data = await gqlFetch(
    `#graphql
    mutation SetShopMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key }
        userErrors { field message }
      }
    }`,
    { metafields: [{ ownerId, namespace: '$app', key, type, value: JSON.stringify(value) }] },
  );
  throwUserErrors(data.metafieldsSet.userErrors);
}

// ── Rules ────────────────────────────────────────────────────────────────────

export const MATCH_TYPES = ['all', 'collection', 'product_type', 'vendor', 'tag'];

export const MATCH_LABELS = {
  all: 'All products (fallback)',
  collection: 'Products in a collection',
  product_type: 'Products of a type',
  vendor: 'Products from a vendor',
  tag: 'Products with a tag',
};

export function createRuleId() {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function fetchRules() {
  const rules = await readShopMetafield('rules');
  if (!Array.isArray(rules)) return [];
  return rules
    .filter((rule) => rule && rule.chartId && rule.match && MATCH_TYPES.includes(rule.match.type))
    .map((rule, index) => ({ ...rule, priority: index + 1 }));
}

export async function saveRules(rules) {
  const normalized = rules.map((rule, index) => ({
    id: rule.id,
    priority: index + 1,
    match: {
      type: rule.match.type,
      value: (rule.match.value ?? '').trim(),
      ...(rule.match.handle ? { handle: rule.match.handle } : {}),
      ...(rule.match.label ? { label: rule.match.label } : {}),
    },
    chartId: rule.chartId,
  }));
  await setShopMetafield('rules', normalized);
}

// ── Settings ─────────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  displayMode: 'modal',
  defaultUnit: 'cm',
  defaultSizeSystem: 'US',
  buttonText: 'Size guide',
  buttonPosition: 'bottom-right',
  primaryColor: '#111111',
  borderRadius: '8px',
  showCalculator: true,
  showFeedback: true,
};

export async function fetchSettings() {
  const stored = await readShopMetafield('settings');
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function saveSettings(settings) {
  await setShopMetafield('settings', settings);
}

// ── Product overrides ────────────────────────────────────────────────────────

export async function setProductOverride(productGid, chartGid) {
  const data = await gqlFetch(
    `#graphql
    mutation SetOverride($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        { ownerId: productGid, namespace: '$app', key: 'size_chart', type: 'metaobject_reference', value: chartGid },
      ],
    },
  );
  throwUserErrors(data.metafieldsSet.userErrors);
}

export async function clearProductOverride(productGid) {
  const data = await gqlFetch(
    `#graphql
    mutation ClearOverride($metafields: [MetafieldIdentifierInput!]!) {
      metafieldsDelete(metafields: $metafields) {
        deletedMetafields { ownerId namespace key }
        userErrors { field message }
      }
    }`,
    { metafields: [{ ownerId: productGid, namespace: '$app', key: 'size_chart' }] },
  );
  throwUserErrors(data.metafieldsDelete.userErrors);
}

export async function fetchOverrides() {
  const stored = await readShopMetafield('overrides');
  if (!Array.isArray(stored)) return [];
  return stored.filter((entry) => entry && entry.productId && entry.chartId);
}

export async function saveOverrideEntry(entry) {
  const overrides = await fetchOverrides();
  const remaining = overrides.filter((item) => item.productId !== entry.productId);
  await setShopMetafield('overrides', [entry, ...remaining]);
}

export async function removeOverrideEntry(productId) {
  const overrides = await fetchOverrides();
  await setShopMetafield('overrides', overrides.filter((item) => item.productId !== productId));
}

// ── Resource search ──────────────────────────────────────────────────────────

export async function resolveCollectionLabels(ids) {
  if (ids.length === 0) return {};
  const data = await gqlFetch(
    `#graphql
    query Collections($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Collection { id title handle }
      }
    }`,
    { ids },
  );
  const map = {};
  for (const node of data.nodes) {
    if (node?.id && node.title && node.handle) map[node.id] = { title: node.title, handle: node.handle };
  }
  return map;
}

export async function searchCollections(search) {
  const data = await gqlFetch(
    `#graphql
    query SearchCollections($query: String!) {
      collections(first: 8, query: $query) {
        nodes { id title handle }
      }
    }`,
    { query: search ? `title:*${search}*` : '' },
  );
  return data.collections.nodes;
}

export async function searchProducts(search) {
  const data = await gqlFetch(
    `#graphql
    query SearchProducts($query: String!) {
      products(first: 8, query: $query) {
        nodes {
          id
          title
          handle
        }
      }
    }`,
    { query: search || '' },
  );
  return data.products.nodes;
}

export function numericGid(gid) {
  const match = /\/(\d+)$/.exec(gid ?? '');
  return match ? match[1] : '';
}
