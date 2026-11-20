export async function getSessionToken() {
  try {
    return (await globalThis.shopify?.idToken?.()) ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}, retried = false) {
  const headers = new Headers(options.headers ?? {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = await getSessionToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(path, { ...options, headers });
  if (!retried && response.status === 401 && response.headers.get('X-Shopify-Retry-Invalid-Session-Request')) {
    return apiFetch(path, options, true);
  }
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!response.ok) throw new Error(data?.error ?? `Request failed (${response.status})`);
  if (text && data === null) throw new Error('The app server returned an unexpected response.');
  return data;
}

export async function ensureSession() {
  return apiFetch('/api/session', { method: 'POST' });
}
