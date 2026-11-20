import { apiFetch } from './session.js';

const APP_HANDLE = document.querySelector('meta[name="app-handle"]')?.content || 'advanced-size-chart';

export async function fetchBilling(force = false) {
  try {
    return await apiFetch(`/api/billing${force ? '?force=1' : ''}`, { method: 'POST' });
  } catch (error) {
    return {
      status: 'unknown',
      trialEndsAt: null,
      daysRemaining: 0,
      configured: true,
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Plan check failed',
    };
  }
}

export function getShopDomain() {
  const fromConfig = globalThis.shopify?.config?.shop;
  if (fromConfig) return fromConfig;
  return new URLSearchParams(location.search).get('shop') ?? '';
}

export function getStoreHandle() {
  return getShopDomain().replace(/\.myshopify\.com$/, '');
}

export function planSelectionUrl() {
  return `https://admin.shopify.com/store/${getStoreHandle()}/charges/${APP_HANDLE}/pricing_plans`;
}

export function openPlanSelection() {
  window.open(planSelectionUrl(), '_top');
}

export function themeEditorUrl(kind = 'block') {
  const store = getStoreHandle();
  if (kind === 'embeds') {
    return `https://admin.shopify.com/store/${store}/themes/current/editor?context=apps&template=product`;
  }
  return `https://admin.shopify.com/store/${store}/themes/current/editor?template=product`;
}

export function isLocked(billing) {
  return billing?.status === 'none';
}

export function billingLabel(billing) {
  if (!billing || billing.status === 'unknown') return 'Status unavailable';
  if (billing.status === 'trial') return `Free trial · ${billing.daysRemaining} day${billing.daysRemaining === 1 ? '' : 's'} left`;
  if (billing.status === 'active') return 'Subscription active';
  return 'Subscription required';
}
