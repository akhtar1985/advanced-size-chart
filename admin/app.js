import { fetchBilling, isLocked, openPlanSelection, billingLabel } from './lib/billing.js';
import { ensureSession } from './lib/session.js';
import { listCharts, fetchRules, fetchSettings, fetchOverrides } from './lib/sizeChart.js';
import { esc, icon, statusBadge } from './ui.js';
import * as dashboard from './pages/dashboard.js';
import * as charts from './pages/charts.js';
import * as editor from './pages/editor.js';
import * as assign from './pages/assign.js';
import * as settings from './pages/settings.js';
import * as plans from './pages/plans.js';
import * as help from './pages/help.js';
import * as info from './pages/info.js';

const app = document.getElementById('app');
const state = {
  billing: null,
  charts: [],
  rules: [],
  settings: null,
  overrides: [],
  error: '',
};

const ROUTES = [
  { path: '/', page: dashboard, params: () => ({}) },
  { path: '/charts', page: charts, params: () => ({}) },
  { path: '/charts/new', page: editor, params: () => ({ id: null }) },
  { pattern: /^\/charts\/(\d+)$/, page: editor, params: (match) => ({ id: state.charts.find((chart) => chart.id.endsWith(`/${match[1]}`))?.id ?? `gid://shopify/Metaobject/${match[1]}` }) },
  { path: '/assign', page: assign, params: () => ({}) },
  { path: '/settings', page: settings, params: () => ({}) },
  { path: '/plans', page: plans, params: () => ({}) },
  { path: '/help', page: help, params: () => ({}) },
  { path: '/info', page: info, params: () => ({}) },
];

const LOCKED_PREFIXES = ['/charts', '/assign', '/settings'];

let toastWrap;
let dialogEl;
let confirmResolve;

boot();

async function boot() {
  try {
    const session = await ensureSession();
    const [billing, chartsList, rules, appSettings, overrides] = await Promise.all([
      session.billing ? session.billing : fetchBilling(false),
      listCharts(),
      fetchRules(),
      fetchSettings(),
      fetchOverrides(),
    ]);
    Object.assign(state, { billing, charts: chartsList, rules, settings: appSettings, overrides });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load your data.';
    state.error = message === 'Unauthorized' ? 'Open this app from your Shopify admin so it can sign in.' : message;
  }
  await render();
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/index.html') return '/';
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

function matchRoute() {
  const path = normalizePath(location.pathname);
  for (const route of ROUTES) {
    if (route.path && route.path === path) return { route, path };
    if (route.pattern) {
      const found = route.pattern.exec(path);
      if (found) return { route, path, params: route.params(found) };
    }
  }
  return { route: null, path };
}

function navigate(path, { replace = false } = {}) {
  if (normalizePath(location.pathname) === normalizePath(path.split('?')[0])) return;
  history[replace ? 'replaceState' : 'pushState']({}, '', path);
  render();
}

async function refresh() {
  const [chartsList, rules, appSettings, overrides] = await Promise.all([
    listCharts(),
    fetchRules(),
    fetchSettings(),
    fetchOverrides(),
  ]);
  Object.assign(state, { charts: chartsList, rules, settings: appSettings, overrides });
}

async function reloadBilling(force = false) {
  state.billing = await fetchBilling(force);
  await render();
}

const ctx = {
  state,
  navigate,
  refresh,
  rerender: render,
  reloadBilling,
  toast,
  confirm: confirmDialog,
};

async function render() {
  const { route, path, params } = matchRoute();
  window.scrollTo(0, 0);

  if (state.error && state.charts.length === 0) {
    app.innerHTML = errorMarkup(state.error);
    document.getElementById('retry')?.addEventListener('click', () => {
      state.error = '';
      app.innerHTML = bootMarkup();
      boot();
    });
    return;
  }

  if (!route) {
    app.innerHTML = `<s-page heading="Page not found">
      <div class="empty"><h3>This page doesn't exist</h3><p>The link may be out of date.</p><a class="btn btn-primary" href="/" data-link>Back to dashboard</a></div>
    </s-page>`;
    return;
  }

  if (isLocked(state.billing) && LOCKED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    app.innerHTML = `<s-page heading="Subscription required">${billingBanner()}${lockMarkup()}</s-page>`;
    app.querySelector('[data-subscribe]')?.addEventListener('click', openPlanSelection);
    return;
  }

  let view;
  try {
    view = await route.page.render(ctx, params ?? route.params?.() ?? {});
  } catch (error) {
    view = {
      heading: 'Something went wrong',
      html: `<s-banner tone="critical"><p>${esc(error instanceof Error ? error.message : 'Unexpected error')}</p></s-banner>
        <p class="mt-16"><a class="btn" href="${esc(path)}" data-link>Try again</a> <a class="btn" href="/" data-link>Back to dashboard</a></p>`,
    };
  }

  app.innerHTML = `<s-page heading="${esc(view.heading ?? '')}">
    ${billingBanner()}
    ${view.html ?? ''}
  </s-page>`;
  document.title = `${view.heading ?? 'Size chart'} · Advanced Size Chart`;
  view.mount?.(app, ctx);
}

function billingBanner() {
  const billing = state.billing;
  if (!billing) return '';
  if (billing.status === 'trial') {
    return `<s-banner tone="warning" class="mb-16">
      <p class="strong">Free trial — ${billing.daysRemaining} ${billing.daysRemaining === 1 ? 'day' : 'days'} left</p>
      <p>Everything works during the trial, including the storefront chart. After ${esc(formatTrialEnd(billing.trialEndsAt))} the chart hides and these pages lock until you subscribe.</p>
      <p><a class="link" href="/plans" data-link>Choose a plan</a></p>
    </s-banner>`;
  }
  if (billing.status === 'none') {
    return `<s-banner tone="critical" class="mb-16">
      <p class="strong">Trial ended — subscription required</p>
      <p>Your storefront chart is hidden and editing is locked. Your charts and settings are still saved.</p>
      <p><a class="link" href="/plans" data-link>See plans</a></p>
    </s-banner>`;
  }
  if (billing.status === 'unknown' && billing.configured === false) {
    return `<s-banner tone="warning" class="mb-16">
      <p class="strong">Plan checks are not configured yet</p>
      <p>Add the Partner API variables in the Worker so trials and subscriptions can be verified. Until then the app stays unlocked.</p>
    </s-banner>`;
  }
  return '';
}

function lockMarkup() {
  return `<div class="lock">
    <div class="lock-icon">${icon('lock', 24)}</div>
    <h2>Your free trial has ended</h2>
    <p>Subscribe to keep editing size charts and showing the size guide on your storefront. Nothing has been deleted — your charts and settings are waiting.</p>
    <button class="btn btn-primary" data-subscribe>Choose a plan</button>
    <p class="small mt-8"><a class="link" href="/plans" data-link>What's included?</a> · <a class="link" href="/help" data-link>Need help?</a></p>
  </div>`;
}

function bootMarkup() {
  return `<div class="boot"><span class="spinner"></span> Loading your size charts…</div>`;
}

function errorMarkup(message) {
  return `<s-page heading="Could not load the app">
    <s-banner tone="critical"><p>${esc(message)}</p></s-banner>
    <p class="mt-16">Check that the app backend is deployed and that the Worker is reachable, then try again.</p>
    <p><button class="btn btn-primary" id="retry">Retry</button> <a class="btn" href="/plans" data-link>Plan status</a></p>
  </s-page>`;
}

function formatTrialEnd(value) {
  if (!value) return 'your trial end date';
  return new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

// ── Toast ────────────────────────────────────────────────────────────────────

function toast(message, tone = 'default') {
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.className = 'toast-wrap';
    document.body.append(toastWrap);
  }
  const el = document.createElement('div');
  el.className = `toast${tone === 'critical' ? ' toast-critical' : ''}`;
  el.textContent = message;
  toastWrap.append(el);
  setTimeout(() => el.remove(), 3600);
}

// ── Confirm dialog ───────────────────────────────────────────────────────────

function confirmDialog({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', tone = 'default' } = {}) {
  if (!dialogEl) {
    dialogEl = document.createElement('dialog');
    dialogEl.innerHTML = `<div class="dialog-body"><h3 id="dlg-title"></h3><p id="dlg-message"></p></div>
      <div class="dialog-actions">
        <button class="btn" value="cancel">Cancel</button>
        <button class="btn btn-primary" value="confirm" id="dlg-confirm"></button>
      </div>`;
    document.body.append(dialogEl);
    dialogEl.addEventListener('close', () => {
      confirmResolve?.(dialogEl.returnValue === 'confirm');
      confirmResolve = null;
    });
    dialogEl.querySelector('#dlg-confirm').addEventListener('click', () => {
      dialogEl.returnValue = 'confirm';
      dialogEl.close();
    });
    dialogEl.querySelector('button[value="cancel"]').addEventListener('click', () => {
      dialogEl.returnValue = 'cancel';
      dialogEl.close();
    });
  }
  dialogEl.querySelector('#dlg-title').textContent = title;
  dialogEl.querySelector('#dlg-message').textContent = message;
  const confirmButton = dialogEl.querySelector('#dlg-confirm');
  confirmButton.textContent = confirmLabel;
  confirmButton.className = `btn ${tone === 'critical' ? 'btn-critical' : 'btn-primary'}`;
  dialogEl.returnValue = 'cancel';
  dialogEl.showModal();
  return new Promise((resolve) => {
    confirmResolve = resolve;
  });
}

// ── Link handling ────────────────────────────────────────────────────────────

document.addEventListener('click', (event) => {
  const link = event.target.closest?.('a[data-link]');
  if (!link) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('#')) return;
  event.preventDefault();
  navigate(href);
});

window.addEventListener('popstate', () => render());

export { state, ctx, statusBadge, billingLabel };
