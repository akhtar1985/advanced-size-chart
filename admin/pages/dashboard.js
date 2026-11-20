import { isLocked, themeEditorUrl } from '../lib/billing.js';
import { fetchExtensionStatus, extensionStatusLabel } from '../lib/extensions.js';
import { fetchFeedback } from '../lib/feedback.js';
import { esc, icon, statusBadge, formatDate, plural } from '../ui.js';

export async function render(ctx) {
  const { charts, rules, overrides, billing } = ctx.state;
  const locked = isLocked(billing);
  const chartCount = charts.length;
  const ruleCount = rules.length;
  const overrideCount = overrides.length;

  const recent = charts.slice(0, 3);
  const extensions = await fetchExtensionStatus();
  const feedback = await fetchFeedback();
  const feedbackRows = Object.entries(feedback.charts)
    .map(([id, counts]) => ({ id, counts, name: charts.find((chart) => chart.id === id)?.name ?? 'Deleted chart' }))
    .sort((a, b) => (b.counts.total ?? 0) - (a.counts.total ?? 0));
  const blockStatus = extensionStatusLabel(extensions.block);
  const embedStatus = extensionStatusLabel(extensions.embed);
  const linksStatus = extensionStatusLabel(extensions.links);
  const anyLive = extensions.block === 'active' || extensions.embed === 'active' || extensions.links === 'active';

  return {
    heading: 'Advanced Size Chart',
    html: `
      <div class="row-between mb-16">
        <p class="page-intro">Create size charts once, then let customers find their size on product pages. ${statusBadge(billing)}</p>
        ${locked
          ? '<button class="btn btn-primary" data-subscribe>Choose a plan</button>'
          : '<a class="btn btn-primary" href="/charts/new" data-link>New size chart</a>'}
      </div>

      <div class="stat-grid mb-16">
        <div class="stat-card">
          <div class="stat-icon">${icon('chart')}</div>
          <div><div class="stat-value">${chartCount}</div><div class="stat-label">${plural(chartCount, 'size chart')}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">${icon('link')}</div>
          <div><div class="stat-value">${ruleCount}</div><div class="stat-label">${plural(ruleCount, 'assignment rule')}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">${icon('store')}</div>
          <div><div class="stat-value">${overrideCount}</div><div class="stat-label">${plural(overrideCount, 'product override')}</div></div>
        </div>
      </div>

      <div class="columns">
        <div class="stack">
          <s-section>
            <div class="row-between mb-8">
              <div>
                <h2 class="panel-title">Storefront setup</h2>
                <p class="muted small mt-0">Live status from your published theme. Use the block or the floating embed — not both. Links can run alongside either.</p>
              </div>
              <span class="badge ${anyLive ? 'badge-success' : 'badge-warning'}">
                ${anyLive ? 'Size guide is live' : 'Not on the storefront yet'}
              </span>
            </div>
            <div class="setup-list">
              <div class="setup-row">
                <div class="stat-icon">${icon('store')}</div>
                <div class="setup-body">
                  <div class="setup-title">Size Chart block</div>
                  <div class="setup-desc">Adds the Size guide button inside the product template.</div>
                </div>
                <div class="setup-side">
                  <span class="badge ${blockStatus.tone === 'neutral' ? '' : `badge-${blockStatus.tone}`}">${esc(blockStatus.text)}</span>
                  <a class="link small" href="${esc(themeEditorUrl('block'))}" target="_top">${extensions.block === 'active' ? 'Edit in theme' : 'Add block'}</a>
                </div>
              </div>
              <div class="setup-row">
                <div class="stat-icon">${icon('sparkle')}</div>
                <div class="setup-body">
                  <div class="setup-title">Size Chart Float embed</div>
                  <div class="setup-desc">A floating button on every product page.</div>
                </div>
                <div class="setup-side">
                  <span class="badge ${embedStatus.tone === 'neutral' ? '' : `badge-${embedStatus.tone}`}">${esc(embedStatus.text)}</span>
                  <a class="link small" href="${esc(themeEditorUrl('embeds'))}" target="_top">${extensions.embed === 'active' ? 'Manage embed' : 'Add embed'}</a>
                </div>
              </div>
              <div class="setup-row">
                <div class="stat-icon">${icon('link')}</div>
                <div class="setup-body">
                  <div class="setup-title">Size Chart Links embed</div>
                  <div class="setup-desc">Optional Size guide links on collection cards and in the cart.</div>
                </div>
                <div class="setup-side">
                  <span class="badge ${linksStatus.tone === 'neutral' ? '' : `badge-${linksStatus.tone}`}">${esc(linksStatus.text)}</span>
                  <a class="link small" href="${esc(themeEditorUrl('embeds'))}" target="_top">${extensions.links === 'active' ? 'Manage embed' : 'Add embed'}</a>
                </div>
              </div>
            </div>
            ${extensions.available
              ? '<p class="hint mt-8">Status covers the published theme only. If you just added the block, reload this page.</p>'
              : '<p class="hint mt-8">Open this page inside the Shopify admin to see live theme status.</p>'}
          </s-section>

          <s-section>
            <div class="row-between mb-8">
              <div>
                <h2 class="panel-title">Get your size guide live</h2>
                <p class="muted small mt-0">Three steps from an empty app to a size button on your product pages.</p>
              </div>
              ${chartCount > 0 && !locked ? '<a class="btn btn-sm" href="/assign" data-link>Go to assignment</a>' : ''}
            </div>
            <ol class="steps">
              <li>
                <h4>Create a size chart ${chartCount > 0 ? '✓' : ''}</h4>
                <p>${chartCount > 0
                  ? `You already have ${chartCount} ${plural(chartCount, 'chart')}. Open <a class="link" href="/charts" data-link>Size charts</a> to edit them.`
                  : 'Start from a product category — T-shirt, shirt, jeans, bottom wear, watch, sunglasses and more — or build one from scratch. <a class="link" href="/charts" data-link>Pick a category</a>.'}</p>
              </li>
              <li>
                <h4>Choose where it appears</h4>
                <p>${ruleCount > 0
                  ? `You have ${ruleCount} ${plural(ruleCount, 'rule')}. Review them in <a class="link" href="/assign" data-link>Assignment</a>.`
                  : 'Assign a chart to all products, a collection, a vendor, a product type or a tag in <a class="link" href="/assign" data-link>Assignment</a>.'}</p>
              </li>
              <li>
                <h4>Turn on the theme button ${anyLive ? '✓' : ''}</h4>
                <p>${anyLive
                  ? 'The size guide is active on your storefront. You can change its placement in the theme editor.'
                  : 'Add the <strong>Size Chart</strong> app block on the product template, or enable the floating <strong>Size Chart Float</strong> app embed.'} <a class="link" href="/help" data-link>Step-by-step help</a>.</p>
              </li>
            </ol>
          </s-section>

          <s-section>
            <div class="row-between mb-8">
              <h2 class="panel-title">Recent charts</h2>
              <a class="link" href="/charts" data-link>View all</a>
            </div>
            ${recent.length === 0
              ? `<div class="empty">
                  <div class="stat-icon" style="margin:0 auto">${icon('sparkle')}</div>
                  <h3>No size charts yet</h3>
                  <p>Pick a product category and your first chart is filled in and ready to customize.</p>
                  <a class="btn btn-primary" href="/charts" data-link>Choose a category</a>
                </div>`
              : `<div class="chart-grid">
                  ${recent.map((chart) => `
                    <div class="chart-card">
                      <div class="chart-card-top">
                        <div>
                          <div class="chart-name">${esc(chart.name || 'Untitled chart')}</div>
                          <div class="chart-meta">${esc(chart.default_unit)} · ${chart.tables} ${plural(chart.tables, 'table')}</div>
                        </div>
                        <span class="badge">${esc(formatDate(chart.updatedAt))}</span>
                      </div>
                      <div class="chart-card-actions">
                        <a class="btn btn-sm" href="/charts/${chart.id.split('/').pop()}" data-link>Open</a>
                        <a class="btn btn-sm" href="/assign" data-link>Assign</a>
                      </div>
                    </div>`).join('')}
                </div>`}
          </s-section>

          <s-section>
            <div class="row-between mb-8">
              <div>
                <h2 class="panel-title">Fit feedback</h2>
                <p class="muted small mt-0">What shoppers said after opening a size guide: runs small, true to size or runs large.</p>
              </div>
              ${feedback.total > 0 ? `<span class="badge">${feedback.total} ${plural(feedback.total, 'vote')}</span>` : ''}
            </div>
            ${feedback.error
              ? `<p class="hint">${esc(feedback.error)}</p>`
              : feedbackRows.length === 0
                ? '<p class="muted small">No votes yet. The feedback bar appears at the bottom of the size guide when Fit feedback is on in Settings.</p>'
                : `<div class="setup-list">
                    ${feedbackRows.map(({ name, counts }) => `
                      <div class="setup-row">
                        <div class="setup-body">
                          <div class="setup-title">${esc(name)}</div>
                          <div class="setup-desc">Runs small ${counts.small ?? 0} · True to size ${counts.true ?? 0} · Runs large ${counts.large ?? 0}</div>
                        </div>
                        <div class="setup-side"><span class="badge">${counts.total ?? 0} ${plural(counts.total ?? 0, 'vote')}</span></div>
                      </div>`).join('')}
                  </div>`}
          </s-section>

          <s-section>
            <h2 class="panel-title mb-8">Go to</h2>
            <div class="tile-grid">
              <a class="tile" href="/charts" data-link>
                <div class="stat-icon">${icon('chart')}</div>
                <div><div class="tile-title">Size charts</div><div class="tile-desc">Templates, tables, units and fit notes</div></div>
              </a>
              <a class="tile" href="/assign" data-link>
                <div class="stat-icon">${icon('link')}</div>
                <div><div class="tile-title">Assignment</div><div class="tile-desc">Show the right chart on the right products</div></div>
              </a>
              <a class="tile" href="/settings" data-link>
                <div class="stat-icon">${icon('settings')}</div>
                <div><div class="tile-title">Settings</div><div class="tile-desc">Button text, unit and display style</div></div>
              </a>
              <a class="tile" href="/help" data-link>
                <div class="stat-icon">${icon('help')}</div>
                <div><div class="tile-title">Help</div><div class="tile-desc">How to add the chart to your theme</div></div>
              </a>
            </div>
          </s-section>
        </div>

        <aside class="rail">
          <div class="card">
            <h3>How customers see it</h3>
            <ul>
              <li>A <strong>Size guide</strong> button opens the chart on product pages.</li>
              <li>Units switch between cm and inches automatically.</li>
              <li><strong>Find my size</strong> uses your measurement columns to suggest a size.</li>
            </ul>
          </div>
          <div class="card">
            <h3>What happens after the trial</h3>
            <p class="small muted mt-0">During the 15-day trial everything is enabled. If no plan is chosen, the storefront chart is hidden and editing locks. Your data stays saved.</p>
            <a class="link" href="/plans" data-link>View plan status</a>
          </div>
          <div class="card">
            <h3>Need a hand?</h3>
            <p class="small muted mt-0">The Help page explains theme setup, rules and troubleshooting with exact steps.</p>
            <a class="link" href="/help" data-link>Open Help</a>
          </div>
        </aside>
      </div>
    `,
    mount(root) {
      root.querySelector('[data-subscribe]')?.addEventListener('click', () => ctx.navigate('/plans'));
    },
  };
}
