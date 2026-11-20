/**
 * Advanced Size Chart – Cloudflare Worker backend.
 *
 * Routes:
 *   /auth, /auth/callback   Direct OAuth install (also token exchange via /api/session)
 *   /api/session            Exchanges the App Bridge session token for an offline token
 *   /api/billing            Session-token protected subscription check (Partner API)
 *   /api/feedback           Session-token protected fit-feedback totals for the admin
 *   /proxy/feedback         App-proxy receiver for storefront fit votes (signature verified)
 *   /webhooks               Compliance + app/uninstalled webhooks (HMAC verified)
 *   everything else         Static admin app from the ASSETS binding
 *
 * Secrets:  SHOPIFY_API_SECRET, SHOPIFY_PARTNER_API_TOKEN
 * Vars:     SHOPIFY_API_KEY, APP_HANDLE, SHOPIFY_PARTNER_ORG_ID, SHOPIFY_PARTNER_APP_ID
 */

const API_VERSION = '2026-10';
const SCOPES = 'write_products,read_products,write_metaobjects,read_metaobjects,write_app_proxy';
const SHOP_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const BILLING_CACHE_MS = 10 * 60 * 1000;
const TRIAL_DAYS = 15;
const VOTE_VALUES = ['small', 'true', 'large'];
const FEEDBACK_TTL_SECONDS = 60 * 60 * 24 * 400;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') return beginOAuth(url, env);
    if (url.pathname === '/auth/callback') return finishOAuth(url, request, env);
    if (url.pathname === '/proxy/feedback') return handleFeedbackVote(request, url, env);
    if (url.pathname === '/webhooks' && request.method === 'POST') return handleWebhook(request, env);
    if (url.pathname.startsWith('/api/')) return handleApi(request, url, env);

    if (env.ASSETS) return serveAssets(request, env);
    return new Response('Not found', { status: 404 });
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(refreshAllBilling(env));
  },
};

// ── OAuth ────────────────────────────────────────────────────────────────────

async function beginOAuth(url, env) {
  const shop = url.searchParams.get('shop') ?? '';
  if (!SHOP_PATTERN.test(shop)) return new Response('Invalid shop domain', { status: 400 });

  const state = crypto.randomUUID();
  const origin = url.origin;
  const authorize = new URL(`https://${shop}/admin/oauth/authorize`);
  authorize.searchParams.set('client_id', env.SHOPIFY_API_KEY);
  authorize.searchParams.set('scope', SCOPES);
  authorize.searchParams.set('redirect_uri', `${origin}/auth/callback`);
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      'Set-Cookie': `asc_state=${state}; Path=/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function finishOAuth(url, request, env) {
  const shop = url.searchParams.get('shop') ?? '';
  const code = url.searchParams.get('code') ?? '';
  const state = url.searchParams.get('state') ?? '';
  const cookieState = readCookie(request.headers.get('Cookie') ?? '', 'asc_state');

  if (!SHOP_PATTERN.test(shop) || !code) return new Response('Invalid OAuth callback', { status: 400 });
  if (!state || state !== cookieState) return new Response('Invalid OAuth state', { status: 403 });
  if (!(await verifyOAuthHmac(url.searchParams, env.SHOPIFY_API_SECRET))) {
    return new Response('Invalid HMAC', { status: 401 });
  }

  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.SHOPIFY_API_KEY, client_secret: env.SHOPIFY_API_SECRET, code }),
  });
  if (!tokenResponse.ok) return new Response('Token exchange failed', { status: 502 });

  const token = await tokenResponse.json();
  if (!token.access_token) return new Response('Token exchange failed', { status: 502 });

  const record = {
    accessToken: token.access_token,
    scope: token.scope ?? SCOPES,
    installedAt: new Date().toISOString(),
    shop,
  };
  await env.SHOPS.put(`shop:${shop}`, JSON.stringify(record));

  try {
    await syncBilling(env, shop, { force: true });
  } catch (error) {
    console.error('Initial billing sync failed', shop, error);
  }

  const storeHandle = shop.replace(/\.myshopify\.com$/, '');
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://admin.shopify.com/store/${storeHandle}/apps/${env.APP_HANDLE}`,
      'Set-Cookie': 'asc_state=; Path=/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}

async function verifyOAuthHmac(params, secret, key = 'hmac') {
  const hmac = params.get(key);
  if (!hmac || !secret) return false;
  const message = [...params.entries()]
    .filter(([key]) => key !== 'hmac' && key !== 'signature')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  const digest = await hmacBytes(secret, message);
  return timingSafeEqual(bytesToHex(digest), hmac);
}

function readCookie(header, name) {
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return '';
}

// ── API ──────────────────────────────────────────────────────────────────────

async function handleApi(request, url, env) {
  try {
    if (url.pathname === '/api/session' && request.method === 'POST') {
      const { shop, token } = await verifySessionToken(request.headers.get('Authorization') ?? '', env, {
        requireInstalled: false,
      });
      if (!(await readShop(env, shop))) await exchangeSessionToken(env, shop, token);
      const billing = await syncBilling(env, shop);
      return json({ shop, billing });
    }

    if (url.pathname === '/api/billing' && request.method === 'POST') {
      const { shop } = await verifySessionToken(request.headers.get('Authorization') ?? '', env);
      const info = await syncBilling(env, shop, { force: url.searchParams.get('force') === '1' });
      return json(info);
    }

    if (url.pathname === '/api/feedback' && request.method === 'GET') {
      const { shop } = await verifySessionToken(request.headers.get('Authorization') ?? '', env);
      return json(await aggregateFeedback(env, shop));
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    if (error?.retrySession) {
      return json({ error: 'Your session expired. Reloading the app usually fixes this.' }, 401, {
        'X-Shopify-Retry-Invalid-Session-Request': '1',
      });
    }
    const status = message === 'Unauthorized' ? 401 : 500;
    console.error('API error', url.pathname, message);
    return json({ error: message }, status);
  }
}

async function verifySessionToken(authorization, env, { requireInstalled = true } = {}) {
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Unauthorized');

  const [headerPart, payloadPart, signaturePart] = parts;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.SHOPIFY_API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(signaturePart),
    new TextEncoder().encode(`${headerPart}.${payloadPart}`),
  );
  if (!valid) throw new Error('Unauthorized');

  const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadPart)));
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < now) throw new Error('Unauthorized');
  if (typeof payload.nbf === 'number' && payload.nbf > now + 5) throw new Error('Unauthorized');
  if (payload.aud !== env.SHOPIFY_API_KEY) throw new Error('Unauthorized');

  const dest = new URL(payload.dest ?? '');
  const shop = dest.hostname;
  if (!SHOP_PATTERN.test(shop)) throw new Error('Unauthorized');
  if (requireInstalled && !(await readShop(env, shop))) throw new Error('Unauthorized');

  return { shop, payload, token };
}

/**
 * Shopify managed installation approves the scopes before the embedded app
 * opens. Trading the App Bridge session token for an offline token keeps the
 * install working without a top-level OAuth redirect, which an iframe can't do.
 */
async function exchangeSessionToken(env, shop, subjectToken) {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      client_id: env.SHOPIFY_API_KEY,
      client_secret: env.SHOPIFY_API_SECRET,
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token: subjectToken,
      subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
      requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (response.status === 400) {
    // An expired ID token is routine; ask App Bridge for a fresh one.
    const error = new Error('Invalid session token');
    error.retrySession = true;
    throw error;
  }
  if (!response.ok || !body.access_token) {
    console.error('Token exchange failed', shop, response.status, body.error ?? '');
    throw new Error('Could not install the app. Open it again from your Shopify admin.');
  }

  const record = {
    accessToken: body.access_token,
    scope: body.scope ?? SCOPES,
    installedAt: new Date().toISOString(),
    shop,
  };
  await env.SHOPS.put(`shop:${shop}`, JSON.stringify(record));

  try {
    await syncBilling(env, shop, { force: true });
  } catch (error) {
    console.error('Initial billing sync failed', shop, error);
  }

  return record;
}

// ── Billing ──────────────────────────────────────────────────────────────────

async function syncBilling(env, shop, { force = false } = {}) {
  const cacheKey = `billing:${shop}`;
  if (!force) {
    const cached = await env.SHOPS.get(cacheKey, 'json');
    if (cached && Date.now() - Date.parse(cached.checkedAt) < BILLING_CACHE_MS) return cached;
  }

  const configured = Boolean(
    env.SHOPIFY_PARTNER_API_TOKEN && env.SHOPIFY_PARTNER_ORG_ID && env.SHOPIFY_PARTNER_APP_ID,
  );
  if (!configured) {
    return { status: 'unknown', trialEndsAt: null, daysRemaining: 0, configured: false, checkedAt: new Date().toISOString() };
  }

  try {
    const shopGid = await getShopGid(env, shop);
    const subscription = await fetchActiveSubscription(env, shopGid);

    // Managed pricing only returns a contract once the merchant has selected a
    // plan. New installs still get the full trial window before anything locks.
    const record = await readShop(env, shop);
    const installedAt = Date.parse(record?.installedAt ?? '');
    const installTrialEnd = Number.isFinite(installedAt) ? installedAt + TRIAL_DAYS * 86400000 : null;

    let status = 'none';
    let trialEndsAt = null;
    let daysRemaining = 0;

    if (subscription) {
      const subTrialEnd = subscription.trialEndsAt ? Date.parse(subscription.trialEndsAt) : NaN;
      if (Number.isFinite(subTrialEnd) && subTrialEnd > Date.now()) {
        status = 'trial';
        trialEndsAt = subscription.trialEndsAt;
      } else {
        status = 'active';
      }
    } else if (installTrialEnd && installTrialEnd > Date.now()) {
      status = 'trial';
      trialEndsAt = new Date(installTrialEnd).toISOString();
    }

    if (status === 'trial' && trialEndsAt) {
      daysRemaining = Math.max(1, Math.ceil((Date.parse(trialEndsAt) - Date.now()) / 86400000));
    }

    const info = {
      status,
      trialEndsAt,
      daysRemaining,
      configured: true,
      checkedAt: new Date().toISOString(),
    };

    await writeBillingMetafield(env, shop, shopGid, info);
    await env.SHOPS.put(cacheKey, JSON.stringify(info), { expirationTtl: 60 * 60 * 24 });
    return info;
  } catch (error) {
    console.error('Billing check failed', shop, error);
    return { status: 'unknown', trialEndsAt: null, daysRemaining: 0, configured: true, checkedAt: new Date().toISOString() };
  }
}

async function fetchActiveSubscription(env, shopGid) {
  const query = `#graphql
    query ActiveSubscription($appId: ID!, $shopId: ID!) {
      activeSubscription(appId: $appId, shopId: $shopId) {
        trialEndsAt
        cancelAtEndOfCycle
      }
    }`;

  const response = await fetch(
    `https://partners.shopify.com/${env.SHOPIFY_PARTNER_ORG_ID}/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_PARTNER_API_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: {
          appId: `gid://shopify/App/${env.SHOPIFY_PARTNER_APP_ID}`,
          shopId: shopGid,
        },
      }),
    },
  );

  const body = await response.json();
  if (!response.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message ?? 'Partner API request failed');
  }
  return body.data?.activeSubscription ?? null;
}

async function writeBillingMetafield(env, shop, shopGid, info) {
  const value = JSON.stringify({
    status: info.status,
    isActive: info.status === 'trial' || info.status === 'active',
    trialEndsAt: info.trialEndsAt,
    checkedAt: info.checkedAt,
  });

  const result = await adminGraphql(env, shop, {
    query: `#graphql
      mutation SetBilling($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors { field message }
        }
      }`,
    variables: { metafields: [{ ownerId: shopGid, key: 'billing', value }] },
  });

  const errors = result.data?.metafieldsSet?.userErrors ?? [];
  if (errors.length > 0) throw new Error(errors.map((error) => error.message).join('; '));
}

async function getShopGid(env, shop) {
  const cacheKey = `gid:${shop}`;
  const cached = await env.SHOPS.get(cacheKey);
  if (cached) return cached;

  const result = await adminGraphql(env, shop, { query: '#graphql query ShopId { shop { id } }' });
  const id = result.data?.shop?.id;
  if (!id) throw new Error('Could not read shop id');
  await env.SHOPS.put(cacheKey, id);
  return id;
}

async function adminGraphql(env, shop, { query, variables }) {
  const record = await readShop(env, shop);
  if (!record) throw new Error('Unauthorized');

  const response = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': record.accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (!response.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message ?? 'Admin API request failed');
  }
  return body;
}

async function refreshAllBilling(env) {
  let cursor;
  do {
    const page = await env.SHOPS.list({ prefix: 'shop:', cursor });
    cursor = page.list_complete ? undefined : page.cursor;
    for (const key of page.keys) {
      const shop = key.name.slice('shop:'.length);
      try {
        await syncBilling(env, shop, { force: true });
      } catch (error) {
        console.error('Scheduled billing sync failed', shop, error);
      }
    }
  } while (cursor);
}

// ── Storefront fit feedback ─────────────────────────────────────────────────

async function handleFeedbackVote(request, url, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const shop = url.searchParams.get('shop') ?? '';
  const timestamp = Number(url.searchParams.get('timestamp'));
  if (!SHOP_PATTERN.test(shop)) return json({ error: 'Invalid shop' }, 400);
  if (!(await verifyOAuthHmac(url.searchParams, env.SHOPIFY_API_SECRET, 'signature'))) {
    return json({ error: 'Invalid signature' }, 401);
  }
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 3600) {
    return json({ error: 'Expired request' }, 401);
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const chartId = String(body?.chartId ?? '');
  const vote = String(body?.vote ?? '');
  const match = /^gid:\/\/shopify\/Metaobject\/(\d+)$/.exec(chartId);
  if (!match || !VOTE_VALUES.includes(vote)) return json({ error: 'Invalid vote' }, 400);

  const key = `feedback:${shop}:${match[1]}:${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  await env.SHOPS.put(key, JSON.stringify({ vote, at: new Date().toISOString() }), {
    expirationTtl: FEEDBACK_TTL_SECONDS,
  });
  return json({ ok: true });
}

async function deleteFeedback(env, shop) {
  const prefix = `feedback:${shop}:`;
  let cursor;
  do {
    const page = await env.SHOPS.list({ prefix, cursor });
    cursor = page.list_complete ? undefined : page.cursor;
    await Promise.all(page.keys.map((key) => env.SHOPS.delete(key.name)));
  } while (cursor);
}

async function aggregateFeedback(env, shop) {
  const prefix = `feedback:${shop}:`;
  const charts = {};
  let total = 0;
  let cursor;

  do {
    const page = await env.SHOPS.list({ prefix, cursor });
    cursor = page.list_complete ? undefined : page.cursor;
    for (const key of page.keys) {
      const numeric = key.name.slice(prefix.length).split(':')[0];
      if (!numeric) continue;
      const entry = await env.SHOPS.get(key.name, 'json');
      const vote = entry?.vote;
      if (!VOTE_VALUES.includes(vote)) continue;
      const id = `gid://shopify/Metaobject/${numeric}`;
      charts[id] ??= { small: 0, true: 0, large: 0, total: 0 };
      charts[id][vote] += 1;
      charts[id].total += 1;
      total += 1;
    }
  } while (cursor);

  return { total, charts };
}

// ── Webhooks ─────────────────────────────────────────────────────────────────

async function handleWebhook(request, env) {
  const topic = request.headers.get('x-shopify-topic') ?? '';
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256') ?? '';
  const body = await request.text();
  const secret = env.SHOPIFY_API_SECRET ?? env.SHOPIFY_WEBHOOK_SECRET;

  const digest = await hmacBytes(secret, body);
  if (!timingSafeEqual(bytesToBase64(digest), hmacHeader)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let payload = {};
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const shop = payload.shop_domain ?? payload.myshopify_domain ?? '';

  if (topic === 'app/uninstalled' && shop) {
    await Promise.all([
      env.SHOPS.delete(`shop:${shop}`),
      env.SHOPS.delete(`billing:${shop}`),
      env.SHOPS.delete(`gid:${shop}`),
      deleteFeedback(env, shop),
    ]);
  }

  if (topic === 'shop/redact' && shop) {
    await Promise.all([
      env.SHOPS.delete(`shop:${shop}`),
      env.SHOPS.delete(`billing:${shop}`),
      env.SHOPS.delete(`gid:${shop}`),
      deleteFeedback(env, shop),
    ]);
  }

  if (topic === 'customers/data_request' || topic === 'customers/redact' || topic === 'shop/redact') {
    console.log(`Compliance webhook ${topic} for ${shop}: no customer data is stored outside Shopify.`);
  }

  return new Response('OK', { status: 200 });
}

// ── Static admin app ─────────────────────────────────────────────────────────

async function serveAssets(request, env) {
  const response = await env.ASSETS.fetch(request);
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) return response;

  const transformed = new HTMLRewriter()
    .on('meta[name="shopify-api-key"]', {
      element(element) {
        element.setAttribute('content', env.SHOPIFY_API_KEY ?? '');
      },
    })
    .on('meta[name="app-handle"]', {
      element(element) {
        element.setAttribute('content', env.APP_HANDLE ?? 'advanced-size-chart');
      },
    })
    .transform(response);

  const headers = new Headers(transformed.headers);
  headers.delete('content-length');
  headers.set('Cache-Control', 'no-store');
  return new Response(transformed.body, { status: transformed.status, headers });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function readShop(env, shop) {
  return env.SHOPS.get(`shop:${shop}`, 'json');
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

async function hmacBytes(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)));
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
