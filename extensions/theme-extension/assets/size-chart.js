(() => {
  'use strict';

  const CM_TO_IN = 0.393701;

  // ── Utilities ──────────────────────────────────────────────────────────────

  function readUnit() {
    try { return localStorage.getItem('sc_unit') || null; } catch { return null; }
  }
  function saveUnit(u) {
    try { localStorage.setItem('sc_unit', u); } catch {}
  }
  function convertVal(val, unit) {
    if (typeof val !== 'number') return val;
    return unit === 'in' ? +(val * CM_TO_IN).toFixed(1) : val;
  }
  function toCm(val, unit) {
    return unit === 'in' ? val / CM_TO_IN : val;
  }
  function parseJSON(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch { return null; }
  }
  function emit(event, data) {
    try { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event, ...data }); } catch {}
  }
  function buildCalculator(chartData, currentUnit, onResult) {
    const table = chartData.tables[0];
    if (!table) return document.createElement('div');

    const container = document.createElement('div');
    container.className = 'sc-calculator';

    const title = document.createElement('h3');
    title.textContent = 'Find My Size';
    title.style.cssText = 'margin: 16px 0 8px; font-size: 16px; font-weight: 600;';
    container.appendChild(title);

    const form = document.createElement('div');
    form.className = 'sc-calc-form';

    const measureCols = table.columns.map((col, i) => {
      const unit = table.units?.[col];
      return unit ? { index: i, name: col, unit } : null;
    }).filter(Boolean);

    const inputs = {};

    measureCols.forEach(col => {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-bottom:12px;';
      
      const label = document.createElement('label');
      label.textContent = `${col.name} (${col.unit})`;
      label.style.fontSize = '13px';
      
      const input = document.createElement('input');
      input.type = 'number';
      input.placeholder = 'Enter measurement';
      input.style.padding = '8px';
      input.addEventListener('input', e => {
        inputs[col.name] = parseFloat(e.target.value);
      });

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      form.appendChild(wrapper);
    });

    const calcBtn = document.createElement('button');
    calcBtn.textContent = 'Calculate Size';
    calcBtn.className = 'sc-calc-btn';
    calcBtn.style.cssText = 'width:100%;padding:10px;background:#000;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:600;margin-top:8px;';
    calcBtn.addEventListener('click', () => {
      const result = calculateSize(table, inputs);
      onResult(result);
    });

    form.appendChild(calcBtn);
    container.appendChild(form);
    return container;
  }

  // ── Calculator Logic ───────────────────────────────────────────────────────────

  function calculateSize(table, userInputs) {
    if (!table) return null;
    const rows = table.rows;
    const cols = table.columns;

    // Identify which columns are numeric measurement columns (exclude Size/System columns)
    const measureCols = cols.map((col, i) => {
      const unit = table.units?.[col];
      return unit ? { index: i, name: col } : null;
    }).filter(Boolean);

    if (measureCols.length === 0) return null;

    let bestRowIndex = -1;
    let minDistance = Infinity;

    rows.forEach((row, ri) => {
      let rowDistance = 0;
      let possible = true;

      measureCols.forEach(col => {
        const tableVal = row[col.index];
        const userVal = userInputs[col.name];

        if (typeof tableVal === 'number' && userVal !== undefined && !isNaN(userVal)) {
          // Simple Euclidean distance for measurements
          rowDistance += Math.pow(tableVal - userVal, 2);
        } else {
          // If the table has a non-numeric value in a measurement column, it's not a candidate
          if (typeof tableVal !== 'number') possible = false;
        }
      });

      if (possible && rowDistance < minDistance) {
        minDistance = rowDistance;
        bestRowIndex = ri;
      }
    });

    return bestRowIndex !== -1 ? rows[bestRowIndex][0] : null;
  }

  function renderCalculator(table, onResult) {
    const container = document.createElement('div');
    container.className = 'sc-calculator';

    const title = document.createElement('h3');
    title.textContent = 'Find My Size';
    title.style.marginBlock = '16px 8px';
    container.appendChild(title);

    const form = document.createElement('div');
    form.className = 'sc-calc-form';

    const measureCols = table.columns.map((col, i) => {
      const unit = table.units?.[col];
      return unit ? { index: i, name: col, unit } : null;
    }).filter(Boolean);

    const inputs = {};

    measureCols.forEach(col => {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-bottom:12px;';
      
      const label = document.createElement('label');
      label.textContent = `${col.name} (${col.unit})`;
      label.style.fontSize = '13px';
      
      const input = document.createElement('input');
      input.type = 'number';
      input.placeholder = 'Enter measurement';
      input.style.padding = '8px';
      input.addEventListener('input', e => {
        inputs[col.name] = parseFloat(e.target.value);
      });

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      form.appendChild(wrapper);
    });

    const calcBtn = document.createElement('button');
    calcBtn.textContent = 'Calculate Size';
    calcBtn.className = 'sc-calc-btn';
    calcBtn.addEventListener('click', () => {
      const result = calculateSize(table, inputs);
      onResult(result);
    });

    form.appendChild(calcBtn);
    container.appendChild(form);
    return container;
  }


  // ── Focus trap ─────────────────────────────────────────────────────────────

  function trapFocus(container) {
    const sel = 'button,a,[tabindex]:not([tabindex="-1"]),input,select';
    const els = () => [...container.querySelectorAll(sel)].filter(e => !e.disabled);
    container.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const all = els();
      if (!all.length) return;
      const first = all[0], last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    els()[0]?.focus();
  }

  // ── Table renderer ──────────��──────────────────────────────────────────────

  function renderTable(table, unit, highlightSize, onRowClick) {
    const cols = table.columns;
    const rows = table.rows;

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    cols.forEach(col => {
      const th = document.createElement('th');
      th.scope = 'col';
      const colUnit = table.units?.[col];
      th.textContent = colUnit ? `${col} (${unit === 'in' ? 'in' : colUnit})` : col;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    const tbody = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.setAttribute('tabindex', '0');
      row.forEach((cell, i) => {
        const td = document.createElement('td');
        const colUnit = table.units?.[cols[i]];
        td.textContent = colUnit ? convertVal(cell, unit) : cell;
        tr.appendChild(td);
      });
      const isHighlighted = highlightSize && String(row[0]).toLowerCase() === highlightSize.toLowerCase();
      if (isHighlighted) {
        tr.classList.add('sc-row-highlight');
        tr.setAttribute('aria-current', 'true');
      }
      tr.addEventListener('click', () => {
        tbody.querySelectorAll('tr').forEach(r => { r.classList.remove('sc-row-highlight'); r.removeAttribute('aria-current'); });
        tr.classList.add('sc-row-highlight');
        tr.setAttribute('aria-current', 'true');
        const size = String(row[0]);
        emit('size_selected', { size, chartName: table.name });
        onRowClick?.(size);
      });
      tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') tr.click(); });
      tbody.appendChild(tr);
    });

    const tbl = document.createElement('table');
    tbl.className = 'sc-table';
    tbl.setAttribute('role', 'table');
    tbl.appendChild(thead);
    tbl.appendChild(tbody);

    const wrap = document.createElement('div');
    wrap.className = 'sc-table-wrap';
    wrap.appendChild(tbl);
    return wrap;
  }

  // ── Find My Size calculator ────────────────────────────────────────────────

  function buildCalculator(chartData, unit, onResult) {
    const wrap = document.createElement('div');
    wrap.className = 'sc-calc';

    const heading = document.createElement('h3');
    heading.className = 'sc-calc-heading';
    heading.textContent = 'Find My Size';
    wrap.appendChild(heading);

    const fields = [
      { key: 'height', label: 'Height' },
      { key: 'chest',  label: 'Chest / Bust' },
      { key: 'waist',  label: 'Waist' },
      { key: 'hips',   label: 'Hips' },
    ];

    const inputs = {};
    const grid = document.createElement('div');
    grid.className = 'sc-calc-grid';

    fields.forEach(f => {
      const label = document.createElement('label');
      label.className = 'sc-calc-label';
      label.textContent = `${f.label} (${unit})`;
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '0.1';
      input.className = 'sc-calc-input';
      input.placeholder = '—';
      inputs[f.key] = input;
      label.appendChild(input);
      grid.appendChild(label);
    });
    wrap.appendChild(grid);

    // Fit preference
    const fitLabel = document.createElement('label');
    fitLabel.className = 'sc-calc-label';
    fitLabel.textContent = 'Fit preference';
    const fitSel = document.createElement('select');
    fitSel.className = 'sc-calc-input';
    [['snug', 'Snug'], ['regular', 'Regular'], ['loose', 'Loose']].forEach(([v, l]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = l;
      fitSel.appendChild(o);
    });
    fitSel.value = 'regular';
    fitLabel.appendChild(fitSel);
    wrap.appendChild(fitLabel);

    const btn = document.createElement('button');
    btn.className = 'sc-calc-btn';
    btn.textContent = 'Find my size';
    wrap.appendChild(btn);

    const result = document.createElement('div');
    result.className = 'sc-calc-result sc-hidden';
    wrap.appendChild(result);

    btn.addEventListener('click', () => {
      const fitOffset = { snug: -2, regular: 0, loose: 2 }[fitSel.value] || 0;
      const measurements = {};
      fields.forEach(f => {
        const v = parseFloat(inputs[f.key].value);
        if (!isNaN(v)) measurements[f.key] = toCm(v, unit);
      });

      if (!Object.keys(measurements).length) {
        result.textContent = 'Please enter at least one measurement.';
        result.classList.remove('sc-hidden');
        return;
      }

      // Find best matching table (first one with numeric columns)
      const table = chartData.tables?.find(t =>
        t.columns.some(c => t.units?.[c]) && t.rows?.length
      ) || chartData.tables?.[0];

      if (!table) { result.textContent = 'No table data available.'; result.classList.remove('sc-hidden'); return; }

      // Map measurement keys to column indices
      const colMap = {};
      table.columns.forEach((col, i) => {
        const lc = col.toLowerCase();
        if (lc.includes('chest') || lc.includes('bust')) colMap.chest = i;
        else if (lc.includes('waist')) colMap.waist = i;
        else if (lc.includes('hip')) colMap.hips = i;
        else if (lc.includes('height')) colMap.height = i;
      });

      let bestRow = null, bestDist = Infinity;
      table.rows.forEach(row => {
        let dist = 0, count = 0;
        Object.entries(measurements).forEach(([key, val]) => {
          const ci = colMap[key];
          if (ci === undefined) return;
          const rowVal = parseFloat(row[ci]);
          if (isNaN(rowVal)) return;
          dist += Math.abs(val - (rowVal + fitOffset));
          count++;
        });
        if (count > 0 && dist < bestDist) { bestDist = dist; bestRow = row; }
      });

      if (!bestRow) { result.textContent = 'Could not determine size. Try entering more measurements.'; result.classList.remove('sc-hidden'); return; }

      const bestIdx = table.rows.indexOf(bestRow);
      const nextRow = table.rows[bestIdx + 1];
      const size = String(bestRow[0]);
      const fallback = nextRow ? ` (or ${nextRow[0]} for more room)` : '';

      result.innerHTML = `<strong>Recommended size: ${size}</strong>${fallback}`;
      result.classList.remove('sc-hidden');

      emit('size_calculator_used', { recommendedSize: size, chartName: chartData.name, fit: fitSel.value });
      onResult?.(size);
    });

    return wrap;
  }

  // ── Chart panel ────────────────────────────────────────────────────────────

  function buildPanel(chartData, settings) {
    // Markets: use market-provided defaults if available, else fall back to localStorage / block setting
    const marketUnit = chartData.marketUnit || null;
    const marketSystem = chartData.marketSizeSystem || null;
    const unit = readUnit() || marketUnit || settings.defaultUnit || chartData.defaultUnit || 'cm';
    const tables = Array.isArray(chartData.tables) ? chartData.tables : [];

    const panel = document.createElement('div');
    panel.className = 'sc-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('dir', document.documentElement.getAttribute('dir') || 'ltr');

    // Header
    const header = document.createElement('div');
    header.className = 'sc-header';
    const title = document.createElement('h2');
    title.className = 'sc-title';
    title.textContent = chartData.name || 'Size Chart';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'sc-close';
    closeBtn.setAttribute('aria-label', 'Close size chart');
    closeBtn.textContent = '✕';
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'sc-controls';

    // Unit toggle
    const unitToggle = document.createElement('div');
    unitToggle.className = 'sc-unit-toggle';
    unitToggle.setAttribute('role', 'group');
    unitToggle.setAttribute('aria-label', 'Unit');
    let currentUnit = unit;
    ['cm', 'in'].forEach(u => {
      const btn = document.createElement('button');
      btn.textContent = u;
      btn.dataset.unit = u;
      btn.className = 'sc-unit-btn' + (u === unit ? ' active' : '');
      btn.setAttribute('aria-pressed', String(u === unit));
      unitToggle.appendChild(btn);
    });
    controls.appendChild(unitToggle);

    // Size system selector
    const systems = chartData.sizeSystems;
    let systemSel = null;
    if (Array.isArray(systems) && systems.length > 1) {
      systemSel = document.createElement('select');
      systemSel.className = 'sc-system-sel';
      systemSel.setAttribute('aria-label', 'Size system');
      systems.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = s;
        if (s === marketSystem) opt.selected = true;
        systemSel.appendChild(opt);
      });
      controls.appendChild(systemSel);
    }

    panel.appendChild(controls);

    // Content area (tabs + tables)
    const content = document.createElement('div');
    content.className = 'sc-content';

    let highlightSize = null;
    const tableWraps = [];

    function renderAllTables(u) {
      tableWraps.forEach((wrap, i) => {
        const tbl = tables[i];
        const newWrap = renderTable(tbl, u, highlightSize, size => { highlightSize = size; });
        wrap.replaceWith(newWrap);
        tableWraps[i] = newWrap;
      });
    }

    if (tables.length > 1) {
      const tabList = document.createElement('div');
      tabList.className = 'sc-tabs';
      tabList.setAttribute('role', 'tablist');
      const tabPanels = [];

      tables.forEach((tbl, i) => {
        const tab = document.createElement('button');
        tab.className = 'sc-tab' + (i === 0 ? ' active' : '');
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(i === 0));
        tab.setAttribute('aria-controls', `sc-tabpanel-${i}`);
        tab.textContent = tbl.name || `Table ${i + 1}`;
        tabList.appendChild(tab);

        const tabPanel = document.createElement('div');
        tabPanel.className = 'sc-tabpanel' + (i === 0 ? '' : ' sc-hidden');
        tabPanel.setAttribute('role', 'tabpanel');
        tabPanel.id = `sc-tabpanel-${i}`;
        const wrap = renderTable(tbl, unit, highlightSize, size => { highlightSize = size; });
        tableWraps.push(wrap);
        tabPanel.appendChild(wrap);
        tabPanels.push(tabPanel);
        content.appendChild(tabPanel);
      });

      content.insertBefore(tabList, content.firstChild);

      tabList.addEventListener('click', e => {
        const tab = e.target.closest('.sc-tab');
        if (!tab) return;
        [...tabList.querySelectorAll('.sc-tab')].forEach((t, i) => {
          const active = t === tab;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', String(active));
          tabPanels[i].classList.toggle('sc-hidden', !active);
        });
      });
    } else if (tables.length === 1) {
      const wrap = renderTable(tables[0], unit, highlightSize, size => { highlightSize = size; });
      tableWraps.push(wrap);
      content.appendChild(wrap);
    }

    panel.appendChild(content);

    // Find My Size calculator
    if (tables.length > 0) {
      const calc = buildCalculator(chartData, currentUnit, size => {
        highlightSize = size;
        renderAllTables(currentUnit);
      });
      panel.appendChild(calc);
    }

    // Measure image
    if (chartData.measureImage) {
      const img = document.createElement('img');
      img.src = chartData.measureImage;
      img.alt = 'Measurement guide';
      img.className = 'sc-measure-img';
      img.loading = 'lazy';
      panel.appendChild(img);
    }

    // Fit notes
    if (chartData.fitNotes) {
      const notes = document.createElement('p');
      notes.className = 'sc-fit-notes';
      notes.textContent = chartData.fitNotes;
      panel.appendChild(notes);
    }

    // Unit toggle handler
    unitToggle.addEventListener('click', e => {
      const btn = e.target.closest('.sc-unit-btn');
      if (!btn) return;
      currentUnit = btn.dataset.unit;
      saveUnit(currentUnit);
      [...unitToggle.querySelectorAll('.sc-unit-btn')].forEach(b => {
        b.classList.toggle('active', b.dataset.unit === currentUnit);
        b.setAttribute('aria-pressed', String(b.dataset.unit === currentUnit));
      });
      renderAllTables(currentUnit);
    });

    return { panel, closeBtn };
  }

  // ── Variant size detection ─────────────────────────────────────────────────

  function getVariantSize() {
    const form = document.querySelector('form[action*="/cart/add"]');
    if (!form) return null;
    const input = form.querySelector('[name="Size"],[name="size"],[data-option-name="Size"],[data-option-index="0"] input:checked,[data-option-index="0"] select');
    return input?.value || null;
  }

  // ── Mount ──────────────────────────────────────────────────────────────────

  function mount(rootEl, chartData, settings) {
    const mode = settings.displayMode || 'modal';
    const btnText = settings.buttonText || 'Size Guide';
    const color = settings.primaryColor || '#000000';
    const radius = settings.borderRadius || '4px';

    if (mode === 'inline') {
      const { panel } = buildPanel(chartData, settings);
      panel.classList.add('sc-inline');
      rootEl.appendChild(panel);
      return;
    }

    if (mode === 'accordion') {
      const btn = document.createElement('button');
      btn.className = 'sc-accordion-btn';
      btn.textContent = btnText;
      btn.style.setProperty('--sc-color', color);
      btn.style.setProperty('--sc-radius', radius);
      btn.setAttribute('aria-expanded', 'false');
      const body = document.createElement('div');
      body.className = 'sc-accordion-body sc-hidden';
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        body.classList.toggle('sc-hidden', open);
        if (!open && !body.hasChildNodes()) {
          const { panel } = buildPanel(chartData, settings);
          panel.classList.add('sc-accordion-panel');
          body.appendChild(panel);
        }
      });
      rootEl.appendChild(btn);
      rootEl.appendChild(body);
      return;
    }

    // modal / drawer
    const triggerBtn = document.createElement('button');
    triggerBtn.className = 'sc-trigger-btn';
    triggerBtn.textContent = btnText;
    triggerBtn.style.setProperty('--sc-color', color);
    triggerBtn.style.setProperty('--sc-radius', radius);
    rootEl.appendChild(triggerBtn);

    let overlay, panelEl;

    function openChart() {
      const variantSize = getVariantSize();
      const data = { ...chartData };
      if (variantSize) data._variantSize = variantSize;

      const { panel, closeBtn } = buildPanel(data, settings);
      panel.classList.add(mode === 'drawer' ? 'sc-drawer' : 'sc-modal');

      overlay = document.createElement('div');
      overlay.className = 'sc-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
      document.body.appendChild(panel);
      document.body.classList.add('sc-open');
      panelEl = panel;

      overlay.addEventListener('click', closeChart);
      closeBtn.addEventListener('click', closeChart);
      document.addEventListener('keydown', onKeyDown);
      trapFocus(panel);

      emit('chart_opened', { chartName: chartData.name });
    }

    function closeChart() {
      panelEl?.remove();
      overlay?.remove();
      document.body.classList.remove('sc-open');
      document.removeEventListener('keydown', onKeyDown);
      triggerBtn.focus();
      panelEl = null;
    }

    function onKeyDown(e) { if (e.key === 'Escape') closeChart(); }

    triggerBtn.addEventListener('click', openChart);

    document.addEventListener('variant:changed', () => { if (panelEl) { closeChart(); openChart(); } });
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  function init() {
    document.querySelectorAll('[id^="size-chart-root-"]').forEach(rootEl => {
      const blockId = rootEl.dataset.block;
      const chartData = parseJSON(`size-chart-data-${blockId}`);
      const settings = parseJSON(`size-chart-settings-${blockId}`);
      if (chartData && settings) mount(rootEl, chartData, settings);
    });

    const floatRoot = document.getElementById('size-chart-float');
    if (floatRoot) {
      const chartData = parseJSON('size-chart-float-data');
      const settings = parseJSON('size-chart-float-settings');
      if (chartData && settings) {
        settings.displayMode = 'modal';
        const pos = settings.position || 'bottom-right';
        floatRoot.classList.add('sc-float', `sc-float--${pos}`);
        mount(floatRoot, chartData, settings);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
