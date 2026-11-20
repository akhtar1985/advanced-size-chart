import { openPlanSelection, planSelectionUrl, isLocked } from '../lib/billing.js';
import { esc, icon, statusBadge, formatDate } from '../ui.js';

export async function render(ctx) {
  const billing = ctx.state.billing ?? {};
  const locked = isLocked(billing);

  const trialEnd = billing.trialEndsAt
    ? new Date(billing.trialEndsAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  let headline;
  let message;
  if (billing.status === 'trial') {
    headline = `${billing.daysRemaining} ${billing.daysRemaining === 1 ? 'day' : 'days'} left in your free trial`;
    message = `Everything is enabled until ${trialEnd}. Choose a plan before then to keep the storefront chart visible and keep editing.`;
  } else if (billing.status === 'active') {
    headline = 'Subscription active';
    message = 'All features are enabled and the size guide stays visible on your storefront.';
  } else if (billing.status === 'none') {
    headline = 'Subscription required';
    message = 'Your trial has ended. The storefront chart is hidden and editing is locked until you subscribe. Your charts, rules and settings are still saved.';
  } else {
    headline = 'Could not confirm your plan';
    message = 'The app could not reach the plan service. If you just subscribed, wait a moment and refresh. The app stays unlocked while the status is unknown.';
  }

  return {
    heading: 'Plan',
    html: `
      <div class="row-between mb-16">
        <p class="page-intro mt-0">One subscription covers every size chart, assignment rule and storefront chart.</p>
        ${statusBadge(billing)}
      </div>

      <div class="columns">
        <div class="stack">
          <s-section>
            <div class="row" style="align-items:flex-start;gap:14px">
              <div class="stat-icon">${icon(locked ? 'lock' : 'check', 20)}</div>
              <div>
                <h2 class="panel-title">${esc(headline)}</h2>
                <p class="muted mt-0">${esc(message)}</p>
              </div>
            </div>

            ${billing.status === 'trial' && trialEnd ? `
              <div class="callout mt-16">
                <strong>Trial ends ${esc(trialEnd)}</strong>
                <p>After that date the storefront chart is hidden and these pages lock until a plan is active. The storefront can take up to one hour to reflect a new subscription.</p>
              </div>` : ''}

            ${locked ? `
              <div class="callout callout-critical mt-16">
                <strong>What is hidden right now</strong>
                <ul>
                  <li>The Size guide button and floating button on the storefront.</li>
                  <li>Chart editing, assignment and settings pages.</li>
                </ul>
              </div>` : ''}

            <div class="row mt-16">
              <button class="btn btn-primary" data-action="choose">${locked ? 'Choose a plan' : 'Manage plan'}</button>
              <button class="btn" data-action="refresh">${icon('sparkle', 15)} Refresh status</button>
            </div>
            <p class="hint mt-8">Plans are handled by Shopify. The pricing page opens in a new view so Shopify can show its secure checkout.</p>
          </s-section>

          <s-section>
            <h2 class="panel-title mb-8">What every plan includes</h2>
            <div class="tile-grid">
              <div class="tile" style="cursor:default">
                <div class="stat-icon">${icon('chart')}</div>
                <div><div class="tile-title">Unlimited charts</div><div class="tile-desc">Tables, size systems, units and fit notes.</div></div>
              </div>
              <div class="tile" style="cursor:default">
                <div class="stat-icon">${icon('link')}</div>
                <div><div class="tile-title">Automatic assignment</div><div class="tile-desc">Collections, vendors, product types, tags and product overrides.</div></div>
              </div>
              <div class="tile" style="cursor:default">
                <div class="stat-icon">${icon('ruler')}</div>
                <div><div class="tile-title">Find my size</div><div class="tile-desc">Suggests a size from customer measurements.</div></div>
              </div>
              <div class="tile" style="cursor:default">
                <div class="stat-icon">${icon('store')}</div>
                <div><div class="tile-title">Theme controls</div><div class="tile-desc">Modal, drawer, inline, accordion or floating button.</div></div>
              </div>
            </div>
          </s-section>

          ${billing.configured === false ? `
            <s-section>
              <div class="callout callout-warning">
                <strong>Plan checks are not configured</strong>
                <p>The Worker needs <span class="mono">SHOPIFY_PARTNER_API_TOKEN</span>, <span class="mono">SHOPIFY_PARTNER_ORG_ID</span> and <span class="mono">SHOPIFY_PARTNER_APP_ID</span>. Until then, trials cannot be verified and the app stays unlocked. See <span class="mono">docs/deploy.md</span>.</p>
              </div>
            </s-section>` : ''}

          ${billing.error ? `<s-banner tone="warning"><p>Last check failed: ${esc(billing.error)}</p></s-banner>` : ''}
        </div>

        <aside class="rail">
          <div class="card">
            <h3>How the trial works</h3>
            <ul>
              <li>New installs get a 15-day free trial.</li>
              <li>During the trial, every feature and the storefront chart are enabled.</li>
              <li>Without a plan, the storefront chart is hidden and editing is locked.</li>
              <li>Nothing is deleted — subscribing restores everything.</li>
            </ul>
          </div>
          <div class="card">
            <h3>Status details</h3>
            <p class="small muted mt-0">Status: <strong>${esc(billing.status ?? 'unknown')}</strong><br />
            Last checked: ${esc(billing.checkedAt ? formatDate(billing.checkedAt) : '—')}<br />
            Trial end: ${esc(trialEnd ?? '—')}</p>
          </div>
          <div class="card">
            <h3>Shopify billing</h3>
            <p class="small muted mt-0">Subscriptions appear on your Shopify invoice and can be cancelled from the pricing page.</p>
            <a class="link" href="${esc(planSelectionUrl())}" target="_top">Open Shopify plans</a>
          </div>
        </aside>
      </div>
    `,
    mount(root) {
      root.querySelector('[data-action="choose"]')?.addEventListener('click', openPlanSelection);

      const refresh = root.querySelector('[data-action="refresh"]');
      refresh?.addEventListener('click', async () => {
        refresh.disabled = true;
        refresh.textContent = 'Checking…';
        try {
          ctx.toast('Checking your subscription…');
          await ctx.reloadBilling(true);
          ctx.toast('Plan status refreshed.');
        } catch (error) {
          refresh.disabled = false;
          refresh.textContent = 'Refresh status';
          ctx.toast(error instanceof Error ? error.message : 'Could not refresh status.', 'critical');
        }
      });
    },
  };
}
