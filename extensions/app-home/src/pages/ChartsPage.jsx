import {useState, useEffect} from 'preact/hooks';
import {useLocation} from 'preact-iso';
import {listCharts, deleteChart, duplicateChart, createChart} from '../../../../shared/models/sizeChart';
import {PRESETS} from '../../../../shared/models/presets.js';
import {useBilling} from '../hooks/useBilling.js';

const FREE_CHART_LIMIT = 3;

export default function ChartsPage() {
  const location = useLocation();
  const {isPro} = useBilling();
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(null);
  const atFreeLimit = !isPro && charts.length >= FREE_CHART_LIMIT;

  useEffect(() => {
    listCharts().then(c => { setCharts(c); setLoading(false); });
  }, []);

  const filtered = charts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id) {
    if (!confirm('Delete this size chart?')) return;
    setBusy(id);
    await deleteChart(id);
    setCharts(prev => prev.filter(c => c.id !== id));
    setBusy(null);
  }

  async function handleCreateSample() {
    setBusy('sample');
    try {
      const id = await createChart(PRESETS[0].chart);
      const updated = await listCharts();
      setCharts(updated);
      location.route(`/chart/${encodeURIComponent(id)}`);
    } finally {
      setBusy(null);
    }
  }
  async function handleDuplicate(id) {
    setBusy(id);
    const updated = await listCharts();
    setCharts(updated);
    setBusy(null);
    location.route(`/chart/${encodeURIComponent(newId)}`);
  }

  return (
    <s-page heading="Size Charts">
      <s-button slot="primary-action" variant="primary" href="/chart/new" disabled={atFreeLimit}>
        Create chart
      </s-button>

      {atFreeLimit && (
        <s-banner tone="warning">
          Free plan is limited to {FREE_CHART_LIMIT} charts. <s-link href="/pricing">Upgrade to Pro</s-link> for unlimited charts, rules, and the size calculator.
        </s-banner>
      )}

      {!loading && charts.length === 0 && (
        <s-section accessibilityLabel="Empty state">
          <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
            <s-grid justifyItems="center" maxInlineSize="480px" gap="base">
              <s-stack alignItems="center">
                <s-heading>Create your first size chart</s-heading>
                <s-paragraph>
                  Build size charts and assign them to products, collections, or your whole store.
                </s-paragraph>
              </s-stack>
              <s-banner tone="info">
                <s-paragraph><strong>Quick start:</strong></s-paragraph>
                <s-paragraph>1. Click <strong>Create chart</strong> and pick a preset template.</s-paragraph>
                <s-paragraph>2. Edit the sizes to match your products and save.</s-paragraph>
                <s-paragraph>3. Go to <strong>Rules</strong> to assign the chart to collections or your whole store.</s-paragraph>
                <s-paragraph>4. In your Shopify theme editor, add the <strong>Size Chart</strong> app block to your product page template.</s-paragraph>
              </s-banner>
              <s-button-group>
                <s-button href="/chart/new">Create chart</s-button>
                <s-button onClick={handleCreateSample} disabled={busy === 'sample'}>Create sample chart</s-button>
              </s-button-group>
            </s-grid>
          </s-grid>
        </s-section>
      )}

      {!loading && charts.length > 0 && (
        <>
          <s-section>
            <s-text-field
              label="Search charts"
              value={search}
              onInput={e => setSearch(e.target.value)}
              clearButton
              onClearButtonClick={() => setSearch('')}
            />
          </s-section>

          <s-section padding="none" accessibilityLabel="Charts table">
            <s-table>
              <s-table-header-row>
                <s-table-header listSlot="primary">Name</s-table-header>
                <s-table-header>Default unit</s-table-header>
                <s-table-header>Actions</s-table-header>
              </s-table-header-row>
              <s-table-body>
                {filtered.map(chart => (
                  <s-table-row key={chart.id}>
                    <s-table-cell>
                      <s-link href={`/chart/${encodeURIComponent(chart.id)}`}>
                        {chart.name || 'Untitled'}
                      </s-link>
                    </s-table-cell>
                    <s-table-cell>{chart.default_unit || 'cm'}</s-table-cell>
                    <s-table-cell>
                      <s-button-group>
                        <s-button
                          size="slim"
                          onClick={() => handleDuplicate(chart.id)}
                          disabled={busy === chart.id}
                        >
                          Duplicate
                        </s-button>
                        <s-button
                          size="slim"
                          tone="critical"
                          onClick={() => handleDelete(chart.id)}
                          disabled={busy === chart.id}
                        >
                          Delete
                        </s-button>
                      </s-button-group>
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>
          </s-section>
        </>
      )}
    </s-page>
  );
}
