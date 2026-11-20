/**
 * Cloudflare Worker – Advanced Size Chart
 *
 * Handles Shopify mandatory compliance webhooks.
 * Secrets (set via `wrangler secret put`):
 *   SHOPIFY_WEBHOOK_SECRET  – your app's webhook signing secret
 */

const COMPLIANCE_TOPICS = new Set([
  'customers/data_request',
  'customers/redact',
  'shop/redact',
]);

const BILLING_TOPICS = new Set([
  'app_subscriptions/update',
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/webhooks') {
      return handleWebhook(request, env);
    }

    return new Response('Not found', { status: 404 });
  },
};

async function handleWebhook(request, env) {
  const topic = request.headers.get('x-shopify-topic') || '';
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256') || '';
  const body = await request.text();

  // Verify HMAC
  const valid = await verifyHmac(body, hmacHeader, env.SHOPIFY_WEBHOOK_SECRET);
  if (!valid) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!COMPLIANCE_TOPICS.has(topic) && !BILLING_TOPICS.has(topic)) {
    return new Response('OK', { status: 200 });
  }

  if (BILLING_TOPICS.has(topic)) {
    const payload = JSON.parse(body);
    console.log(`Billing event: ${topic} status=${payload.app_subscription?.status}`);
    // No server-side state to update — billing status is read live from
    // currentAppInstallation in the App Home on each load.
    return new Response('OK', { status: 200 });
  }

  // Compliance webhooks: acknowledge immediately.
  // This app stores no customer PII — all data lives in Shopify metaobjects.
  // No deletion or export action is required beyond acknowledgement.
  console.log(`Compliance webhook received: ${topic}`);

  return new Response('OK', { status: 200 });
}

async function verifyHmac(body, hmacHeader, secret) {
  if (!secret || !hmacHeader) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return computed === hmacHeader;
}
