import {useState, useEffect} from 'preact/hooks';
import {fetchRules, saveRules, listCharts} from '../../../../shared/models/sizeChart';

const MATCH_TYPES = [
  {value: 'collection', label: 'Collection (GID)'},
  {value: 'vendor', label: 'Vendor'},
  {value: 'product_type', label: 'Product type'},
  {value: 'tag', label: 'Tag'},
  {value: 'all', label: 'All products'},
];

let _nextId = Date.now();
const nextId = () => `r${_nextId++}`;

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchRules(), listCharts()]).then(([r, c]) => {
      setRules(r);
      setCharts(c);
      setLoading(false);
    });
  }, []);

  function addRule() {
    setRules(prev => [
      ...prev,
      {id: nextId(), priority: prev.length + 1, match: {type: 'all', value: ''}, chartId: charts[0]?.id || ''},
    ]);
  }

  function updateRule(id, patch) {
    setRules(prev => prev.map(r => r.id === id ? {...r, ...patch} : r));
  }

  function updateMatch(id, patch) {
    setRules(prev => prev.map(r => r.id === id ? {...r, match: {...r.match, ...patch}} : r));
  }

  function removeRule(id) {
    setRules(prev => prev.filter(r => r.id !== id).map((r, i) => ({...r, priority: i + 1})));
  }

  function moveRule(id, dir) {
    setRules(prev => {
      const idx = prev.findIndex(r => r.id === id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr.map((r, i) => ({...r, priority: i + 1}));
    });
  }

  async function handleSave() {
    setSaving(true);
    await saveRules(rules);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <s-page heading="Rules"><s-spinner /></s-page>;

  return (
    <s-page heading="Assignment Rules">
      <s-paragraph slot="subtitle">
        Rules are evaluated in priority order. The first match wins. Per-product overrides always take precedence.
      </s-paragraph>
      <s-button slot="primary-action" variant="primary" onClick={handleSave} loading={saving}>
        {saved ? 'Saved!' : 'Save rules'}
      </s-button>

      <s-section>
        {rules.length === 0 && (
          <s-paragraph>No rules yet. Add a rule to assign charts automatically.</s-paragraph>
        )}

        {rules.map((rule, i) => (
          <s-card key={rule.id} style="margin-bottom:12px;padding:12px;border:1px solid #e5e5e5;border-radius:6px">
            <s-stack direction="inline" gap="small" alignItems="center" style="flex-wrap:wrap">
              <s-badge tone="neutral">#{i + 1}</s-badge>

              <select
                value={rule.match.type}
                onChange={e => updateMatch(rule.id, {type: e.target.value, value: ''})}
                style="padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px"
              >
                {MATCH_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              {rule.match.type !== 'all' && (
                <input
                  value={rule.match.value}
                  placeholder={rule.match.type === 'collection' ? 'gid://shopify/Collection/...' : 'Value'}
                  onInput={e => updateMatch(rule.id, {value: e.target.value})}
                  style="padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px;min-width:200px"
                />
              )}

              <select
                value={rule.chartId}
                onChange={e => updateRule(rule.id, {chartId: e.target.value})}
                style="padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px"
              >
                <option value="">— Select chart —</option>
                {charts.map(c => (
                  <option key={c.id} value={c.id}>{c.name || 'Untitled'}</option>
                ))}
              </select>

              <s-button-group>
                <s-button size="slim" onClick={() => moveRule(rule.id, -1)} disabled={i === 0}>↑</s-button>
                <s-button size="slim" onClick={() => moveRule(rule.id, 1)} disabled={i === rules.length - 1}>↓</s-button>
                <s-button size="slim" tone="critical" onClick={() => removeRule(rule.id)}>Remove</s-button>
              </s-button-group>
            </s-stack>
          </s-card>
        ))}

        <s-button onClick={addRule} style="margin-top:8px">+ Add rule</s-button>
      </s-section>
    </s-page>
  );
}
