const API = 'shopify:admin/api/graphql.json';

async function gql(query, variables = {}) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? `Request failed (${response.status})`);
  }
  return payload.data;
}

function userErrors(errors) {
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join(' '));
  }
}

export async function loadProduct(productId) {
  const data = await gql(
    `#graphql
    query ProductOverride($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        metafield(namespace: "$app", key: "size_chart") { value }
      }
      shop {
        id
        metafield(namespace: "$app", key: "billing") { value }
      }
    }`,
    { id: productId },
  );
  if (!data.product) throw new Error('This product could not be loaded.');

  let billing = null;
  try {
    billing = data.shop?.metafield?.value ? JSON.parse(data.shop.metafield.value) : null;
  } catch {
    billing = null;
  }

  return {
    product: data.product,
    shopId: data.shop?.id ?? '',
    locked: billing?.isActive === false,
  };
}

export async function loadCharts() {
  const data = await gql(
    `#graphql
    query SizeCharts {
      metaobjects(type: "$app:size_chart", first: 50, sortKey: "updated_at", reverse: true) {
        nodes {
          id
          displayName
          fields { key value }
        }
      }
    }`,
  );
  return (data.metaobjects?.nodes ?? []).map((node) => {
    const name = node.fields?.find((field) => field.key === 'name')?.value;
    return { id: node.id, name: name || node.displayName || 'Untitled chart' };
  });
}

export async function saveOverride({ product, shopId, chartId }) {
  if (chartId) {
    const data = await gql(
      `#graphql
      mutation SetOverride($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { key }
          userErrors { field message }
        }
      }`,
      {
        metafields: [
          { ownerId: product.id, namespace: '$app', key: 'size_chart', type: 'metaobject_reference', value: chartId },
        ],
      },
    );
    userErrors(data.metafieldsSet.userErrors);
  } else {
    const data = await gql(
      `#graphql
      mutation ClearOverride($metafields: [MetafieldIdentifierInput!]!) {
        metafieldsDelete(metafields: $metafields) {
          deletedMetafields { ownerId namespace key }
          userErrors { field message }
        }
      }`,
      { metafields: [{ ownerId: product.id, namespace: '$app', key: 'size_chart' }] },
    );
    userErrors(data.metafieldsDelete.userErrors);
  }

  await syncOverrideRegistry({ product, shopId, chartId });
}

async function syncOverrideRegistry({ product, shopId, chartId }) {
  if (!shopId) return;
  const current = await gql(
    `#graphql
    query ShopOverrides {
      shop { metafield(namespace: "$app", key: "overrides") { value } }
    }`,
  );

  let overrides = [];
  try {
    const parsed = JSON.parse(current.shop?.metafield?.value ?? '[]');
    if (Array.isArray(parsed)) overrides = parsed;
  } catch {
    overrides = [];
  }

  const rest = overrides.filter((entry) => entry?.productId !== product.id);
  const next = chartId
    ? [{ productId: product.id, title: product.title, handle: product.handle, chartId }, ...rest]
    : rest;

  const data = await gql(
    `#graphql
    mutation SaveOverrides($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        { ownerId: shopId, namespace: '$app', key: 'overrides', type: 'json', value: JSON.stringify(next) },
      ],
    },
  );
  userErrors(data.metafieldsSet.userErrors);
}
