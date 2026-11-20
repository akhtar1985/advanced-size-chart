const CACHE_MS = 60 * 1000;

let cache = null;

export async function fetchExtensionStatus(force = false) {
  if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  const value = { block: 'unknown', embed: 'unknown', links: 'unknown', available: false };

  try {
    const extensions = await globalThis.shopify?.app?.extensions?.();
    if (Array.isArray(extensions)) {
      value.available = true;
      const themeExtension = extensions.find((extension) => extension.type === 'theme_app_extension');
      for (const activation of themeExtension?.activations ?? []) {
        if (activation.handle === 'size_chart') value.block = activation.status ?? 'unknown';
        if (activation.handle === 'size_chart_floating') value.embed = activation.status ?? 'unknown';
        if (activation.handle === 'size_chart_links') value.links = activation.status ?? 'unknown';
      }
    }
  } catch {
    value.available = false;
  }

  cache = { at: Date.now(), value };
  return value;
}

export function extensionStatusLabel(status) {
  if (status === 'active') return { text: 'Active on your theme', tone: 'success' };
  if (status === 'available') return { text: 'Not added to the theme', tone: 'warning' };
  if (status === 'unavailable') return { text: 'Disabled by the theme', tone: 'warning' };
  return { text: 'Status not available yet', tone: 'neutral' };
}
