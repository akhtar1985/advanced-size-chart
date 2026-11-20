import {useState, useEffect} from 'preact/hooks';
import {useRoute, useLocation} from 'preact-iso';
import {
  fetchChart, createChart, updateChart, deleteChart,
  getPrimedChart, EMPTY_CHART, EMPTY_TABLE,
} from '../../../../shared/models/sizeChart';
import {PRESETS} from '../../../../shared/models/presets.js';

const SIZE_SYSTEMS = ['US', 'EU', 'UK', 'IN', 'AU', 'JP', 'IT', 'FR'];

export default function ChartEditorPage() {
  const {params} = useRoute();
  const location = useLocation();
  const isNew = params.id === 'new';
  const id = isNew ? null : decodeURIComponent(params.id);

  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');

  function applyPreset(preset) {
    setChart({...EMPTY_CHART, ...preset.chart});
  }

  useEffect(() => {
    if (isNew) { setChart({...EMPTY_CHART, tables: [{...EMPTY_TABLE}]}); return; }
    const primed = getPrimedChart(id);
    if (primed) { setChart(primed); setLoading(false); return; }
    fetchChart(id).then(c => { setChart(c); setLoading(false); });
  }, [id]);

  if (loading || !chart) return <s-page heading="Loading…"><s-spinner /></s-page>;

  const update = patch => setChart(prev => ({...prev, ...patch}));
  const updateTable = (ti, patch) => setChart(prev => {
    const tables = [...prev.tables];
    tables[ti] = {...tables[ti], ...patch};
    return {...prev, tables};
  });

  // ── Table cell editing ────────────────────────────────────────────────────

  function setCell(ti, ri, ci, val) {
    const tables = [...chart.tables];
    const rows = tables[ti].rows.map(r => [...r]);
    const num = parseFloat(val);
    rows[ri][ci] = isNaN(num) ? val : num;
    tables[ti] = {...tables[ti], rows};
    setChart(prev => ({...prev, tables}));
  }

  function addRow(ti) {
    const tbl = chart.tables[ti];
    const newRow = tbl.columns.map((_, ci) => ci === 0 ? '' : 0);
    updateTable(ti, {rows: [...tbl.rows, newRow]});
  }

  function removeRow(ti, ri) {
    const tbl = chart.tables[ti];
    updateTable(ti, {rows: tbl.rows.filter((_, i) => i !== ri)});
  }

  function addColumn(ti) {
    const tbl = chart.tables[ti];
    const name = `Col ${tbl.columns.length + 1}`;
    updateTable(ti, {
      columns: [...tbl.columns, name],
      rows: tbl.rows.map(r => [...r, 0]),
      units: {...tbl.units, [name]: 'cm'},
    });
  }

  function removeColumn(ti, ci) {
    const tbl = chart.tables[ti];
    const newCols = tbl.columns.filter((_, i) => i !== ci);
    const newUnits = {...tbl.units};
    delete newUnits[tbl.columns[ci]];
    updateTable(ti, {
      columns: newCols,
      rows: tbl.rows.map(r => r.filter((_, i) => i !== ci)),
      units: newUnits,
    });
  }

  function setColHeader(ti, ci, val) {
    const tbl = chart.tables[ti];
    const oldName = tbl.columns[ci];
    const newCols = [...tbl.columns];
    newCols[ci] = val;
    const newUnits = {...tbl.units};
    if (oldName in newUnits) { newUnits[val] = newUnits[oldName]; delete newUnits[oldName]; }
    updateTable(ti, {columns: newCols, units: newUnits});
  }

  function setColUnit(ti, ci, unit) {
    const tbl = chart.tables[ti];
    updateTable(ti, {units: {...tbl.units, [tbl.columns[ci]]: unit}});
  }

  // ── CSV import ────────────────────────────────────────────────────────────

  function importCSV(ti, text) {
    const lines = text.trim().split('\n').map(l => l.split(',').map(c => c.trim()));
    if (lines.length < 2) return;
    const columns = lines[0];
    const rows = lines.slice(1).map(r => r.map((v, i) => i === 0 ? v : (parseFloat(v) || v)));
    updateTable(ti, {columns, rows});
  }

  function handleCSVFile(ti, e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => importCSV(ti, ev.target.result);
    reader.readAsText(file);
  }

  // ── CSV export ────────────────────────────────────────────────────────────

  function exportCSV() {
    const lines = chart.tables.map(tbl => {
      const header = tbl.columns.join(',');
      const rows = tbl.rows.map(r => r.join(',')).join('\n');
      return `# ${tbl.name}\n${header}\n${rows}`;
    }).join('\n\n');
    const blob = new Blob([lines], {type: 'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${chart.name || 'size-chart'}.csv`;
    a.click();
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(chart, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${chart.name || 'size-chart'}.json`;
    a.click();
  }

  // ── Save / Delete ─────────────────────────────────────────────────────────

  async function handleSave() {
    if (!chart.name.trim()) { setError('Chart name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const newId = await createChart(chart);
        location.route(`/chart/${encodeURIComponent(newId)}`);
      } else {
        await updateChart(id, chart);
      }
    } catch (e) {
      setError('Save failed. Please try again.');
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm('Delete this chart?')) return;
    await deleteChart(id);
    location.route('/');
  }

  const tbl = chart.tables[activeTab] || chart.tables[0];

  return (
    <s-page heading={isNew ? 'New size chart' : (chart.name || 'Edit chart')}>
      <s-button slot="primary-action" variant="primary" onClick={handleSave} loading={saving}>
        Save
      </s-button>
      {!isNew && (
        <s-button slot="secondary-action" tone="critical" onClick={handleDelete}>
          Delete
        </s-button>
      )}
      <s-button slot="secondary-action" onClick={exportCSV}>Export CSV</s-button>
      <s-button slot="secondary-action" onClick={exportJSON}>Export JSON</s-button>

      {error && <s-banner tone="critical">{error}</s-banner>}

      {/* Presets – only shown for new charts */}
      {isNew && (
        <s-section heading="Start from a preset">
          <s-paragraph>Pick a template to pre-fill the chart with real size data. You can edit everything after.</s-paragraph>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p)}
                style={`
                  padding:8px 14px;
                  border:2px solid ${chart.name === p.chart.name ? '#000' : '#ddd'};
                  border-radius:6px;
                  background:${chart.name === p.chart.name ? '#000' : '#fff'};
                  color:${chart.name === p.chart.name ? '#fff' : '#333'};
                  font-size:13px;
                  cursor:pointer;
                  transition:all .15s;
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
        </s-section>
      )}

      {/* Basic info */}
      <s-section heading="Chart details">
        <s-form-layout>
          <s-text-field
            label="Chart name"
            value={chart.name}
            onInput={e => update({name: e.target.value})}
            requiredIndicator
          />
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:4px">Default unit</label>
            <select
              style="padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:14px;width:100%"
              value={chart.default_unit}
              onInput={e => update({default_unit: e.target.value})}
            >
              <option value="cm">Centimetres (cm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>
          <s-text-field
            label="Fit notes"
            value={chart.fit_notes}
            onInput={e => update({fit_notes: e.target.value})}
            multiline={2}
          />
        </s-form-layout>
      </s-section>

      {/* Size systems */}
      <s-section heading="Size systems">
        <s-stack direction="inline" gap="small" wrap>
          {SIZE_SYSTEMS.map(sys => (
            <s-checkbox
              key={sys}
              label={sys}
              checked={chart.size_systems.includes(sys)}
              onChange={e => {
                const systems = e.target.checked
                  ? [...chart.size_systems, sys]
                  : chart.size_systems.filter(s => s !== sys);
                update({size_systems: systems});
              }}
            />
          ))}
        </s-stack>
      </s-section>

      {/* Tables */}
      <s-section heading="Tables">
        {/* Tab bar */}
        {chart.tables.length > 1 && (
          <s-stack direction="inline" gap="small" style="margin-bottom:12px">
            {chart.tables.map((t, i) => (
              <s-button
                key={i}
                variant={i === activeTab ? 'primary' : 'secondary'}
                size="slim"
                onClick={() => setActiveTab(i)}
              >
                {t.name || `Table ${i + 1}`}
              </s-button>
            ))}
          </s-stack>
        )}

        {tbl && (
          <>
            <s-form-layout>
              <s-text-field
                label="Table name"
                value={tbl.name}
                onInput={e => updateTable(activeTab, {name: e.target.value})}
              />
            </s-form-layout>

            {/* Grid editor */}
            <div style="overflow-x:auto;margin-top:12px">
              <table style="border-collapse:collapse;font-size:13px;min-width:400px">
                <thead>
                  <tr>
                    {tbl.columns.map((col, ci) => (
                      <th key={ci} style="padding:4px;border:1px solid #ddd;background:#f5f5f5">
                        <div style="display:flex;flex-direction:column;gap:2px">
                          <input
                            value={col}
                            onInput={e => setColHeader(activeTab, ci, e.target.value)}
                            style="width:80px;padding:2px 4px;border:1px solid #ccc;border-radius:3px;font-size:12px"
                          />
                          {ci > 0 && (
                            <select
                              value={tbl.units[col] || 'cm'}
                              onChange={e => setColUnit(activeTab, ci, e.target.value)}
                              style="font-size:11px;padding:1px"
                            >
                              <option value="cm">cm</option>
                              <option value="in">in</option>
                              <option value="">—</option>
                            </select>
                          )}
                          <button
                            onClick={() => removeColumn(activeTab, ci)}
                            style="font-size:10px;color:#c00;background:none;border:none;cursor:pointer"
                          >✕ col</button>
                        </div>
                      </th>
                    ))}
                    <th style="padding:4px;border:1px solid #ddd">
                      <button
                        onClick={() => addColumn(activeTab)}
                        style="font-size:12px;background:none;border:1px solid #999;border-radius:3px;padding:2px 6px;cursor:pointer"
                      >+ Col</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tbl.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style="padding:4px;border:1px solid #ddd">
                          <input
                            value={cell}
                            onInput={e => setCell(activeTab, ri, ci, e.target.value)}
                            style="width:70px;padding:2px 4px;border:1px solid #ccc;border-radius:3px;font-size:12px"
                          />
                        </td>
                      ))}
                      <td style="padding:4px;border:1px solid #ddd">
                        <button
                          onClick={() => removeRow(activeTab, ri)}
                          style="color:#c00;background:none;border:none;cursor:pointer;font-size:12px"
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <s-stack direction="inline" gap="small" style="margin-top:10px">
              <s-button size="slim" onClick={() => addRow(activeTab)}>+ Add row</s-button>
              <s-button size="slim" onClick={() => {
                setChart(prev => ({
                  ...prev,
                  tables: [...prev.tables, {...EMPTY_TABLE, name: `Table ${prev.tables.length + 1}`}],
                }));
                setActiveTab(chart.tables.length);
              }}>+ Add table</s-button>
              {chart.tables.length > 1 && (
                <s-button size="slim" tone="critical" onClick={() => {
                  setChart(prev => ({
                    ...prev,
                    tables: prev.tables.filter((_, i) => i !== activeTab),
                  }));
                  setActiveTab(Math.max(0, activeTab - 1));
                }}>Remove table</s-button>
              )}
            </s-stack>

            {/* CSV import */}
            <s-stack direction="inline" gap="small" style="margin-top:12px;align-items:center">
              <s-text>Import CSV:</s-text>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={e => handleCSVFile(activeTab, e)}
                style="font-size:13px"
              />
            </s-stack>
          </>
        )}
      </s-section>
    </s-page>
  );
}
