/**
 * Advanced Size Chart – storefront renderer.
 * Loaded as a module so duplicate block/embed includes execute once.
 */

const UNITS = { cm: 1, in: 2.54, mm: 0.1 };
const VOTE_VALUES = ['small', 'true', 'large'];
const VOTE_KEYS = { small: 'vote_small', true: 'vote_true', large: 'vote_large' };

const LOCALES = {
  en: {
    size_guide: 'Size guide',
    measurements: 'Measurements shown in {unit}',
    size_system_suffix: ' · size system {system}',
    display_unit: 'Display unit',
    close: 'Close size guide',
    size_system: 'Size system',
    how_to_measure: 'How to measure',
    table: 'Table {n}',
    opens_for: 'Opens for {option}: {value}',
    vote_small: 'Runs small',
    vote_true: 'True to size',
    vote_large: 'Runs large',
    thanks: 'Thanks — you rated this guide {label}.',
    fit_question: 'How does this size guide fit?',
    fit_feedback: 'Fit feedback',
    recommended: 'Recommended size',
    calc_note: 'Based on the measurements you entered. Check the full table below for details.',
    find_my_size: 'Find my size',
    calc_hint: 'Enter your measurements in {unit}. Leave a field blank if you do not know it.',
    hw_title: 'Find your size by height and weight',
    hw_hint: 'Enter your height in {heightUnit} and weight in {weightUnit}. Leave one blank if you only know the other.',
    height: 'Height ({unit})',
    weight: 'Weight ({unit})',
    recommend: 'Recommend size',
    hw_note: 'Based on the height and weight ranges in this guide. Check the full table below for details.',
    err_hw_empty: 'Enter your height or weight.',
    err_hw_no_row: 'No size row covers that input.',
    err_no_measurement: 'Enter at least one measurement.',
    err_no_numeric: 'This chart has no numeric measurements to compare.',
    empty_table: 'This table has no rows yet.',
  },
  fr: {
    size_guide: 'Guide des tailles',
    measurements: 'Mesures affichées en {unit}',
    size_system_suffix: ' · système de tailles {system}',
    display_unit: 'Unité d’affichage',
    close: 'Fermer le guide des tailles',
    size_system: 'Système de tailles',
    how_to_measure: 'Comment prendre les mesures',
    table: 'Tableau {n}',
    opens_for: 'S’ouvre pour {option} : {value}',
    vote_small: 'Taille petite',
    vote_true: 'Taille habituelle',
    vote_large: 'Taille grande',
    thanks: 'Merci — vous avez évalué ce guide : {label}.',
    fit_question: 'Comment taille ce guide ?',
    fit_feedback: 'Avis sur la taille',
    recommended: 'Taille recommandée',
    calc_note: 'D’après les mesures saisies. Consultez le tableau complet ci-dessous pour les détails.',
    find_my_size: 'Trouver ma taille',
    calc_hint: 'Saisissez vos mesures en {unit}. Laissez un champ vide si vous ne le connaissez pas.',
    hw_title: 'Trouver sa taille selon la stature et le poids',
    hw_hint: 'Indiquez votre stature en {heightUnit} et votre poids en {weightUnit}. Laissez un champ vide si vous ne connaissez que l’autre.',
    height: 'Stature ({unit})',
    weight: 'Poids ({unit})',
    recommend: 'Recommander une taille',
    hw_note: 'D’après les plages de stature et de poids de ce guide. Consultez le tableau complet ci-dessous.',
    err_hw_empty: 'Indiquez votre stature ou votre poids.',
    err_hw_no_row: 'Aucune ligne de taille ne couvre ces valeurs.',
    err_no_measurement: 'Saisissez au moins une mesure.',
    err_no_numeric: 'Ce tableau ne contient aucune mesure numérique à comparer.',
    empty_table: 'Ce tableau ne contient encore aucune ligne.',
  },
  de: {
    size_guide: 'Größentabelle',
    measurements: 'Maße in {unit}',
    size_system_suffix: ' · Größensystem {system}',
    display_unit: 'Angezeigte Einheit',
    close: 'Größentabelle schließen',
    size_system: 'Größensystem',
    how_to_measure: 'Richtig messen',
    table: 'Tabelle {n}',
    opens_for: 'Öffnet für {option}: {value}',
    vote_small: 'Fällt klein aus',
    vote_true: 'Passt genau',
    vote_large: 'Fällt groß aus',
    thanks: 'Danke — Sie haben diese Tabelle als {label} bewertet.',
    fit_question: 'Wie fällt diese Größentabelle aus?',
    fit_feedback: 'Passform-Feedback',
    recommended: 'Empfohlene Größe',
    calc_note: 'Basierend auf Ihren Eingaben. Details finden Sie in der vollständigen Tabelle unten.',
    find_my_size: 'Meine Größe finden',
    calc_hint: 'Geben Sie Ihre Maße in {unit} ein. Lassen Sie ein Feld leer, wenn Sie es nicht kennen.',
    hw_title: 'Größe nach Körpergröße und Gewicht finden',
    hw_hint: 'Geben Sie Ihre Körpergröße in {heightUnit} und Ihr Gewicht in {weightUnit} ein. Lassen Sie ein Feld leer, wenn Sie nur das andere kennen.',
    height: 'Körpergröße ({unit})',
    weight: 'Gewicht ({unit})',
    recommend: 'Größe empfehlen',
    hw_note: 'Basierend auf den Größen- und Gewichtsbereichen dieser Tabelle. Details finden Sie in der vollständigen Tabelle unten.',
    err_hw_empty: 'Geben Sie Ihre Körpergröße oder Ihr Gewicht ein.',
    err_hw_no_row: 'Keine Größenzeile deckt diese Eingabe ab.',
    err_no_measurement: 'Geben Sie mindestens ein Maß ein.',
    err_no_numeric: 'Diese Tabelle enthält keine numerischen Maße zum Vergleichen.',
    empty_table: 'Diese Tabelle hat noch keine Zeilen.',
  },
  es: {
    size_guide: 'Guía de tallas',
    measurements: 'Medidas en {unit}',
    size_system_suffix: ' · sistema de tallas {system}',
    display_unit: 'Unidad mostrada',
    close: 'Cerrar la guía de tallas',
    size_system: 'Sistema de tallas',
    how_to_measure: 'Cómo tomar las medidas',
    table: 'Tabla {n}',
    opens_for: 'Se abre para {option}: {value}',
    vote_small: 'Queda pequeña',
    vote_true: 'Talla habitual',
    vote_large: 'Queda grande',
    thanks: 'Gracias — valoraste esta guía como {label}.',
    fit_question: '¿Cómo queda esta guía de tallas?',
    fit_feedback: 'Opinión sobre la talla',
    recommended: 'Talla recomendada',
    calc_note: 'Según las medidas introducidas. Consulta la tabla completa más abajo para ver los detalles.',
    find_my_size: 'Encontrar mi talla',
    calc_hint: 'Introduce tus medidas en {unit}. Deja un campo vacío si no lo conoces.',
    hw_title: 'Encuentra tu talla por altura y peso',
    hw_hint: 'Introduce tu altura en {heightUnit} y tu peso en {weightUnit}. Deja uno vacío si solo conoces el otro.',
    height: 'Altura ({unit})',
    weight: 'Peso ({unit})',
    recommend: 'Recomendar talla',
    hw_note: 'Según los rangos de altura y peso de esta guía. Consulta la tabla completa más abajo para ver los detalles.',
    err_hw_empty: 'Introduce tu altura o tu peso.',
    err_hw_no_row: 'Ninguna fila de tallas cubre ese valor.',
    err_no_measurement: 'Introduce al menos una medida.',
    err_no_numeric: 'Esta tabla no tiene medidas numéricas que comparar.',
    empty_table: 'Esta tabla aún no tiene filas.',
  },
  it: {
    size_guide: 'Guida alle taglie',
    measurements: 'Misure in {unit}',
    size_system_suffix: ' · sistema taglie {system}',
    display_unit: 'Unità visualizzata',
    close: 'Chiudi la guida alle taglie',
    size_system: 'Sistema taglie',
    how_to_measure: 'Come prendere le misure',
    table: 'Tabella {n}',
    opens_for: 'Si apre per {option}: {value}',
    vote_small: 'Veste piccolo',
    vote_true: 'Veste giusto',
    vote_large: 'Veste grande',
    thanks: 'Grazie — hai valutato questa guida come {label}.',
    fit_question: 'Come veste questa guida alle taglie?',
    fit_feedback: 'Feedback sulla vestibilità',
    recommended: 'Taglia consigliata',
    calc_note: 'In base alle misure inserite. Controlla la tabella completa qui sotto per i dettagli.',
    find_my_size: 'Trova la mia taglia',
    calc_hint: 'Inserisci le tue misure in {unit}. Lascia vuoto un campo se non lo conosci.',
    hw_title: 'Trova la taglia in base ad altezza e peso',
    hw_hint: 'Inserisci l’altezza in {heightUnit} e il peso in {weightUnit}. Lascia vuoto uno dei due se conosci solo l’altro.',
    height: 'Altezza ({unit})',
    weight: 'Peso ({unit})',
    recommend: 'Consiglia taglia',
    hw_note: 'In base agli intervalli di altezza e peso di questa guida. Controlla la tabella completa qui sotto per i dettagli.',
    err_hw_empty: 'Inserisci altezza o peso.',
    err_hw_no_row: 'Nessuna riga di taglie copre questi dati.',
    err_no_measurement: 'Inserisci almeno una misura.',
    err_no_numeric: 'Questa tabella non contiene misure numeriche da confrontare.',
    empty_table: 'Questa tabella non ha ancora righe.',
  },
  ja: {
    size_guide: 'サイズガイド',
    measurements: '表示単位: {unit}',
    size_system_suffix: '・サイズ規格 {system}',
    display_unit: '表示単位',
    close: 'サイズガイドを閉じる',
    size_system: 'サイズ規格',
    how_to_measure: '採寸方法',
    table: '表 {n}',
    opens_for: '{option}「{value}」で表示',
    vote_small: '小さめ',
    vote_true: 'ちょうどよい',
    vote_large: '大きめ',
    thanks: 'ありがとうございます。このガイドを「{label}」と評価しました。',
    fit_question: 'このサイズガイドのサイズ感はどうですか？',
    fit_feedback: 'サイズ感のフィードバック',
    recommended: 'おすすめサイズ',
    calc_note: '入力した寸法に基づく目安です。詳しくは下の表をご確認ください。',
    find_my_size: 'サイズを探す',
    calc_hint: '寸法を {unit} で入力してください。わからない項目は空欄のままで構いません。',
    hw_title: '身長と体重からサイズを探す',
    hw_hint: '身長を {heightUnit}、体重を {weightUnit} で入力してください。片方しかわからない場合はもう片方を空欄にしてください。',
    height: '身長（{unit}）',
    weight: '体重（{unit}）',
    recommend: 'サイズを提案',
    hw_note: 'このガイドの身長・体重の範囲に基づく目安です。詳しくは下の表をご確認ください。',
    err_hw_empty: '身長または体重を入力してください。',
    err_hw_no_row: '入力値に合うサイズの行がありません。',
    err_no_measurement: '寸法を1つ以上入力してください。',
    err_no_numeric: 'この表には比較できる数値の寸法がありません。',
    empty_table: 'この表にはまだ行がありません。',
  },
  'zh-cn': {
    size_guide: '尺码指南',
    measurements: '测量单位：{unit}',
    size_system_suffix: ' · 尺码体系 {system}',
    display_unit: '显示单位',
    close: '关闭尺码指南',
    size_system: '尺码体系',
    how_to_measure: '如何测量',
    table: '表格 {n}',
    opens_for: '打开 {option}：{value}',
    vote_small: '偏小',
    vote_true: '标准',
    vote_large: '偏大',
    thanks: '谢谢 — 您将本指南评为{label}。',
    fit_question: '这份尺码指南的版型如何？',
    fit_feedback: '版型反馈',
    recommended: '推荐尺码',
    calc_note: '基于您输入的测量数据。详情请查看下方完整表格。',
    find_my_size: '查找我的尺码',
    calc_hint: '请输入您的测量数据（单位：{unit}）。不了解的字段可以留空。',
    hw_title: '根据身高和体重查找尺码',
    hw_hint: '请输入身高（{heightUnit}）和体重（{weightUnit}）。如果只了解其中一项，另一项可以留空。',
    height: '身高（{unit}）',
    weight: '体重（{unit}）',
    recommend: '获取推荐尺码',
    hw_note: '基于本指南中的身高和体重范围。详情请查看下方完整表格。',
    err_hw_empty: '请输入身高或体重。',
    err_hw_no_row: '没有覆盖该数据的尺码行。',
    err_no_measurement: '请至少输入一项测量数据。',
    err_no_numeric: '此表格没有可比较的数值测量数据。',
    empty_table: '此表格还没有任何行。',
  },
  'pt-br': {
    size_guide: 'Guia de tamanhos',
    measurements: 'Medidas em {unit}',
    size_system_suffix: ' · sistema de tamanhos {system}',
    display_unit: 'Unidade exibida',
    close: 'Fechar o guia de tamanhos',
    size_system: 'Sistema de tamanhos',
    how_to_measure: 'Como tirar as medidas',
    table: 'Tabela {n}',
    opens_for: 'Abre para {option}: {value}',
    vote_small: 'Veste pequeno',
    vote_true: 'Tamanho habitual',
    vote_large: 'Veste grande',
    thanks: 'Obrigado — você avaliou este guia como {label}.',
    fit_question: 'Como este guia de tamanhos veste?',
    fit_feedback: 'Avaliação do caimento',
    recommended: 'Tamanho recomendado',
    calc_note: 'Com base nas medidas informadas. Veja a tabela completa abaixo para mais detalhes.',
    find_my_size: 'Encontrar meu tamanho',
    calc_hint: 'Informe suas medidas em {unit}. Deixe um campo em branco se não souber.',
    hw_title: 'Encontre seu tamanho por altura e peso',
    hw_hint: 'Informe sua altura em {heightUnit} e seu peso em {weightUnit}. Deixe um em branco se souber apenas o outro.',
    height: 'Altura ({unit})',
    weight: 'Peso ({unit})',
    recommend: 'Recomendar tamanho',
    hw_note: 'Com base nas faixas de altura e peso deste guia. Veja a tabela completa abaixo para mais detalhes.',
    err_hw_empty: 'Informe sua altura ou seu peso.',
    err_hw_no_row: 'Nenhuma linha de tamanhos cobre esses valores.',
    err_no_measurement: 'Informe pelo menos uma medida.',
    err_no_numeric: 'Esta tabela não tem medidas numéricas para comparar.',
    empty_table: 'Esta tabela ainda não tem linhas.',
  },
};

function localeDict(value) {
  const clean = String(value ?? '').trim().toLowerCase().replace('_', '-');
  if (LOCALES[clean]) return LOCALES[clean];
  const base = clean.split('-')[0];
  if (base === 'zh') return LOCALES['zh-cn'];
  if (base === 'pt') return LOCALES['pt-br'];
  return LOCALES[base] || LOCALES.en;
}

function makeT(dict) {
  return (key, vars) => {
    const template = dict[key] ?? LOCALES.en[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])));
  };
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function readJSON(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}

function parseMaybeJSON(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeChart(data) {
  if (!data || typeof data !== 'object') return null;
  const parsedSystems = parseMaybeJSON(data.sizeSystems ?? data.size_systems);
  const systems = Array.isArray(parsedSystems) ? parsedSystems.map(String) : [];
  const tables = parseMaybeJSON(data.tables) ?? [];
  const translation = parseMaybeJSON(data.translation);
  const translatedTables = Array.isArray(translation?.tables) ? translation.tables : [];
  const translated = (value, fallback) => (typeof value === 'string' && value.trim() ? value : fallback);

  return {
    name: translated(translation?.name, data.name ?? ''),
    defaultUnit: data.defaultUnit ?? data.default_unit ?? 'cm',
    sizeSystems: systems,
    tables: Array.isArray(tables) ? tables.map((table, index) => {
      const normalized = withSizeSystemColumns(table, systems);
      const trTable = translatedTables[index];
      if (!trTable || typeof trTable !== 'object') return normalized;
      return {
        ...normalized,
        name: translated(trTable.name, normalized.name),
        ...(trTable.columns && typeof trTable.columns === 'object' ? { columnLabels: trTable.columns } : {}),
      };
    }) : [],
    fitNotes: translated(translation?.fitNotes, data.fitNotes ?? data.fit_notes ?? ''),
    measureInstructions: translated(translation?.measureInstructions, data.measureInstructions ?? data.measure_instructions ?? ''),
    measureImage: data.measureImage ?? data.measure_image ?? '',
  };
}

function columnLabel(table, column) {
  const label = table?.columnLabels?.[column];
  return typeof label === 'string' && label.trim() ? label : column;
}

function withSizeSystemColumns(table, systems) {
  if (!table || !Array.isArray(table.columns)) return table;
  const derived = { ...(table.sizeSystemColumns ?? {}) };
  for (const system of systems) {
    const cleanSystem = String(system).trim().toUpperCase();
    if (!cleanSystem) continue;
    const column = table.columns.find((name) => {
      const clean = String(name).trim().toUpperCase();
      return clean === cleanSystem || clean.startsWith(`${cleanSystem} `) || clean.startsWith(`${cleanSystem}-`);
    });
    if (column) derived[system] = column;
  }
  return { ...table, sizeSystemColumns: derived };
}

const refreshers = new WeakMap();

function init() {
  document.querySelectorAll('[data-asc-root]:not([data-asc-ready])').forEach(initRoot);
}

function initRoot(root) {
  const uid = root.dataset.uid;
  const chart = normalizeChart(readJSON(`asc-data-${uid}`));
  const settings = readJSON(`asc-settings-${uid}`) || {};
  if (!chart || !Array.isArray(chart.tables) || chart.tables.length === 0) return;

  root.dataset.ascReady = 'true';

  const t = makeT(localeDict(settings.locale));
  const chartTitle = chart.name || t('size_guide');
  const buttonLabel = settings.buttonText && settings.buttonText !== 'Size guide' ? settings.buttonText : t('size_guide');

  const isFloat = root.dataset.mode === 'float';
  const placement = root.dataset.placement || '';
  const productHandle = root.dataset.productHandle || '';
  const baseUnit = UNITS[chart.defaultUnit] ? chart.defaultUnit : 'cm';
  const units = baseUnit === 'mm' ? ['mm'] : ['cm', 'in'];
  const systems = Array.isArray(chart.sizeSystems) ? chart.sizeSystems : [];
  const primary = settings.primaryColor || '#111111';
  const radius = settings.borderRadius || '8px';

  let displayMode = settings.displayMode || 'modal';
  if (!['modal', 'drawer', 'inline', 'accordion', 'link'].includes(displayMode)) displayMode = 'modal';
  if (isFloat) {
    if (displayMode === 'link' || displayMode === 'inline' || displayMode === 'accordion') displayMode = 'drawer';
  }
  const isLink = displayMode === 'link';
  const panelMode = isLink ? 'modal' : displayMode;
  const overlayMode = isLink || displayMode === 'modal' || displayMode === 'drawer';

  const storedUnit = safeStorageGet('asc.unit');
  const initialUnit = units.includes(storedUnit)
    ? storedUnit
    : units.includes(settings.marketUnit)
      ? settings.marketUnit
      : units.includes(settings.defaultUnit)
        ? settings.defaultUnit
        : baseUnit;

  const storedSystem = safeStorageGet('asc.system');
  const systemList = systems.length > 0 ? systems : [];
  const initialSystem = [storedSystem, settings.marketSizeSystem, settings.defaultSizeSystem].find((item) => item && systemList.includes(item))
    || systemList[0]
    || '';

  const state = {
    unit: initialUnit,
    system: initialSystem,
    table: 0,
    inputs: {},
    result: null,
    hwInputs: {},
    hwResult: null,
    vote: settings.chartId ? safeStorageGet(`asc.vote.${settings.chartId}`) : null,
  };

  const initialMatch = resolvedTableIndex(variantContext(root));
  if (initialMatch !== state.table) state.table = initialMatch;

  root.style.setProperty('--asc-primary', primary);
  root.style.setProperty('--asc-on-primary', contrastColor(primary));
  root.style.setProperty('--asc-radius', radius);
  root.classList.add('asc-root');
  if (isFloat) {
    root.classList.add('asc-float', `asc-float-${settings.position === 'bottom-left' ? 'left' : 'right'}`);
  } else if (displayMode === 'inline' || displayMode === 'accordion') {
    root.classList.add('asc-inline');
    if (displayMode === 'accordion') root.classList.add('asc-accordion');
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = isFloat ? 'asc-btn asc-btn-float' : isLink ? 'asc-link' : 'asc-btn';
  button.textContent = buttonLabel;
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-haspopup', 'dialog');
  root.append(button);

  if (isLink) {
    button.style.color = primary;
    const placed = placement === 'card' || placement === 'cart'
      ? placeNearProductTitle(button, productHandle, placement)
      : placeNextToVariantPicker(button);
    if (placed) {
      root.hidden = true;
    } else {
      root.classList.add('asc-link-fallback');
    }
  }

  let overlay = null;
  let panel = null;
  let isOpen = false;
  let lastFocus = null;

  button.addEventListener('click', () => (isOpen ? close() : open()));

  function open() {
    isOpen = true;
    lastFocus = document.activeElement;
    button.setAttribute('aria-expanded', 'true');

    const match = resolvedTableIndex(variantContext(root));
    if (match !== state.table) {
      state.table = match;
      state.inputs = {};
      state.result = null;
      state.hwResult = null;
    }

    if (overlayMode) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'asc-overlay';
        overlay.style.setProperty('--asc-primary', primary);
        overlay.style.setProperty('--asc-on-primary', contrastColor(primary));
        overlay.style.setProperty('--asc-radius', radius);
        overlay.innerHTML = `<div class="asc-panel asc-panel-${panelMode}" role="dialog" aria-modal="true" aria-label="${esc(chartTitle)}"></div>`;
        panel = overlay.querySelector('.asc-panel');
        bindPanel(panel);
        overlay.addEventListener('mousedown', (event) => {
          if (event.target === overlay) close();
        });
        document.body.append(overlay);
      }
      renderPanel();
      document.body.classList.add('asc-no-scroll');
      requestAnimationFrame(() => overlay.classList.add('asc-open'));
      panel.querySelector('.asc-close')?.focus();
      document.addEventListener('keydown', onKeydown);
    } else {
      if (!panel) {
        panel = document.createElement('div');
        panel.className = 'asc-panel asc-panel-inline';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', chartTitle);
        bindPanel(panel);
        root.append(panel);
      }
      renderPanel();
      root.classList.add('is-open');
      panel.querySelector('.asc-close')?.focus();
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    button.setAttribute('aria-expanded', 'false');
    if (overlayMode && overlay) {
      overlay.classList.remove('asc-open');
      document.body.classList.remove('asc-no-scroll');
      document.removeEventListener('keydown', onKeydown);
      const node = overlay;
      setTimeout(() => node.remove(), 180);
      overlay = null;
      panel = null;
    } else {
      root.classList.remove('is-open');
      if (panel) panel.hidden = true;
    }
    if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
  }

  function onKeydown(event) {
    if (event.key === 'Escape') close();
  }

  // ── Panel rendering ──────────────────────────────────────────────────────

  function renderPanel() {
    if (!panel) return;
    panel.hidden = false;
    panel.innerHTML = panelMarkup();
    const current = panel.querySelector('.asc-row.is-current');
    if (current && state.result) current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function bindPanel(panelEl) {
    panelEl.addEventListener('click', (event) => {
      const target = event.target.closest('[data-asc-close]');
      if (target) {
        close();
        return;
      }
      const unitButton = event.target.closest('[data-asc-unit]');
      if (unitButton) {
        state.unit = unitButton.dataset.ascUnit;
        state.inputs = {};
        state.result = null;
        safeStorageSet('asc.unit', state.unit);
        renderPanel();
        return;
      }
      const tabButton = event.target.closest('[data-asc-tab]');
      if (tabButton) {
        state.table = Number(tabButton.dataset.ascTab);
        state.inputs = {};
        state.result = null;
        state.hwResult = null;
        renderPanel();
        return;
      }
      if (event.target.closest('[data-asc-calc]')) {
        calculate();
      }
      if (event.target.closest('[data-asc-hw]')) {
        recommendHeightWeight();
      }
      const voteButton = event.target.closest('[data-asc-vote]');
      if (voteButton) {
        submitVote(voteButton.dataset.ascVote);
      }
    });

    panelEl.addEventListener('change', (event) => {
      const select = event.target.closest('[data-asc-system]');
      if (!select) return;
      state.system = select.value;
      safeStorageSet('asc.system', state.system);
      renderPanel();
    });

    panelEl.addEventListener('input', (event) => {
      const hwField = event.target.closest('[data-asc-hw-height], [data-asc-hw-weight]');
      if (hwField) {
        state.hwInputs[hwField.hasAttribute('data-asc-hw-height') ? 'height' : 'weight'] = hwField.value;
        return;
      }
      const input = event.target.closest('[data-asc-measure]');
      if (!input) return;
      state.inputs[input.dataset.ascMeasure] = input.value;
    });
  }

  function activeTable() {
    return chart.tables[state.table] ?? chart.tables[0];
  }

  function panelMarkup() {
    const table = activeTable();
    const variantRow = findVariantRow(table, root);
    const hwRow = state.hwResult?.row;
    const highlightRow = Number.isInteger(hwRow) && hwRow >= 0 ? hwRow : state.result ? state.result.row : variantRow;
    const measurementCols = measurementColumns(table);
    const showCalc = settings.showCalculator !== false && measurementCols.length > 0;
    const showUnits = units.length > 1;

    return `
      <div class="asc-head">
        <div class="asc-heading">
          <h2 class="asc-title">${esc(chartTitle)}</h2>
          <p class="asc-sub">${esc(t('measurements', { unit: state.unit }))}${state.system ? esc(t('size_system_suffix', { system: state.system })) : ''}</p>
        </div>
        <div class="asc-head-actions">
          ${showUnits
            ? `<div class="asc-seg" role="group" aria-label="${esc(t('display_unit'))}">
                ${units.map((unit) => `<button type="button" class="asc-seg-btn ${unit === state.unit ? 'is-active' : ''}" data-asc-unit="${unit}" aria-pressed="${unit === state.unit}">${unit}</button>`).join('')}
              </div>`
            : `<span class="asc-unit-pill">${esc(state.unit)}</span>`}
          <button type="button" class="asc-close" data-asc-close aria-label="${esc(t('close'))}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
      </div>

      <div class="asc-body">
        ${systemList.length > 1 ? `
          <label class="asc-system">
            <span>${esc(t('size_system'))}</span>
            <select data-asc-system>
              ${systemList.map((system) => `<option value="${esc(system)}" ${system === state.system ? 'selected' : ''}>${esc(system)}</option>`).join('')}
            </select>
          </label>` : ''}

        ${chart.measureInstructions || chart.measureImage ? `
          <div class="asc-measure">
            ${chart.measureImage ? `<img src="${esc(chart.measureImage)}" alt="${esc(t('how_to_measure'))}" loading="lazy" />` : ''}
            ${chart.measureInstructions ? `<p>${esc(chart.measureInstructions).replaceAll('\n', '<br />')}</p>` : ''}
          </div>` : ''}

        ${showCalc ? calculatorMarkup(measurementCols, table) : ''}

        ${heightWeightMarkup(table)}

        ${chart.tables.length > 1 ? `
          <div class="asc-tabs" role="tablist">
            ${chart.tables.map((item, index) => `<button type="button" role="tab" class="asc-tab ${index === state.table ? 'is-active' : ''}" aria-selected="${index === state.table}" data-asc-tab="${index}"${item.variant ? ` title="${esc(t('opens_for', { option: item.variant.option, value: item.variant.value }))}"` : ''}>${esc(item.name || t('table', { n: index + 1 }))}</button>`).join('')}
          </div>` : ''}

        ${tableMarkup(table, highlightRow)}

        ${chart.fitNotes ? `<div class="asc-notes">${esc(chart.fitNotes).replaceAll('\n', '<br />')}</div>` : ''}

        ${feedbackMarkup()}
      </div>
    `;
  }

  function feedbackMarkup() {
    if (settings.showFeedback === false || !settings.chartId) return '';
    const voteLabel = (vote) => t(VOTE_KEYS[vote] ?? 'vote_true');
    if (state.vote) {
      const label = VOTE_KEYS[state.vote] ? voteLabel(state.vote) : state.vote;
      const [before, after] = t('thanks').split('{label}');
      return `<div class="asc-feedback is-done">
        <p class="asc-feedback-q">${esc(before)}<strong>${esc(label)}</strong>${esc(after ?? '')}</p>
      </div>`;
    }
    return `<div class="asc-feedback">
      <p class="asc-feedback-q">${esc(t('fit_question'))}</p>
      <div class="asc-feedback-options" role="group" aria-label="${esc(t('fit_feedback'))}">
        ${VOTE_VALUES.map((vote) => `<button type="button" class="asc-feedback-btn" data-asc-vote="${vote}">${esc(voteLabel(vote))}</button>`).join('')}
      </div>
    </div>`;
  }

  async function submitVote(vote) {
    if (!VOTE_VALUES.includes(vote) || state.vote || !settings.chartId) return;
    state.vote = vote;
    safeStorageSet(`asc.vote.${settings.chartId}`, vote);
    renderPanel();
    try {
      const response = await fetch('/apps/size-chart/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartId: settings.chartId, vote }),
        keepalive: true,
      });
      if (!response.ok) console.warn('Size chart feedback was saved on this device but not sent.');
    } catch {
      console.warn('Size chart feedback was saved on this device but not sent.');
    }
  }

  function calculatorMarkup(columns, table) {
    const result = state.result
      ? `<div class="asc-result">
          <div>
            <div class="asc-result-label">${esc(t('recommended'))}</div>
            <div class="asc-result-size">${esc(state.result.size || '—')}${state.result.systemValue ? `<span class="asc-result-badge">${esc(state.system)} ${esc(state.result.systemValue)}</span>` : ''}</div>
            <div class="asc-result-note">${esc(t('calc_note'))}</div>
          </div>
        </div>`
      : '';

    return `
      <div class="asc-calc">
        <h3>${esc(t('find_my_size'))}</h3>
        <p class="asc-calc-hint">${esc(t('calc_hint', { unit: state.unit }))}</p>
        <div class="asc-calc-grid">
          ${columns.map((column) => `
            <label class="asc-field">
              <span>${esc(columnLabel(table, column.name))} (${esc(state.unit)})</span>
              <input type="number" inputmode="decimal" step="0.1" min="0" data-asc-measure="${column.index}"
                     value="${esc(state.inputs[column.index] ?? '')}" placeholder="0" />
            </label>`).join('')}
        </div>
        <button type="button" class="asc-calc-btn" data-asc-calc>${esc(t('find_my_size'))}</button>
        ${result}
      </div>
    `;
  }

  function heightWeightMarkup(table) {
    const guide = table?.heightWeight;
    if (!guide || !Array.isArray(guide.rows)) return '';
    if (guide.rows.map(parseHeightWeightRow).filter(Boolean).length === 0) return '';
    const heightUnit = guide.heightUnit === 'in' ? 'in' : 'cm';
    const weightUnit = guide.weightUnit === 'lb' ? 'lb' : 'kg';
    const result = state.hwResult
      ? `<div class="asc-result">
          <div>
            <div class="asc-result-label">${esc(t('recommended'))}</div>
            <div class="asc-result-size">${esc(state.hwResult.size || '—')}</div>
            <div class="asc-result-note">${esc(t('hw_note'))}</div>
          </div>
        </div>`
      : '';

    return `
      <div class="asc-calc asc-hw">
        <h3>${esc(t('hw_title'))}</h3>
        <p class="asc-calc-hint">${esc(t('hw_hint', { heightUnit, weightUnit }))}</p>
        <div class="asc-calc-grid">
          <label class="asc-field">
            <span>${esc(t('height', { unit: heightUnit }))}</span>
            <input type="number" inputmode="decimal" step="0.1" min="0" data-asc-hw-height
                   value="${esc(state.hwInputs.height ?? '')}" placeholder="0" />
          </label>
          <label class="asc-field">
            <span>${esc(t('weight', { unit: weightUnit }))}</span>
            <input type="number" inputmode="decimal" step="0.1" min="0" data-asc-hw-weight
                   value="${esc(state.hwInputs.weight ?? '')}" placeholder="0" />
          </label>
        </div>
        <button type="button" class="asc-calc-btn" data-asc-hw>${esc(t('recommend'))}</button>
        ${result}
      </div>
    `;
  }

  function parseNumeric(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const number = Number.parseFloat(String(value).replace(',', '.'));
    return Number.isFinite(number) ? number : null;
  }

  function parseHeightWeightRow(row) {
    const size = String(row?.size ?? '').trim();
    if (!size) return null;
    const range = (minValue, maxValue) => {
      const min = parseNumeric(minValue);
      const max = parseNumeric(maxValue);
      if (min === null && max === null) return null;
      const low = min ?? max;
      const high = max ?? min;
      return [Math.min(low, high), Math.max(low, high)];
    };
    const height = range(row?.heightMin, row?.heightMax);
    const weight = range(row?.weightMin, row?.weightMax);
    return height || weight ? { size, height, weight } : null;
  }

  function recommendHeightWeight() {
    const current = activeTable();
    const rows = (current?.heightWeight?.rows ?? []).map(parseHeightWeightRow).filter(Boolean);
    if (rows.length === 0) return;
    const height = parseNumeric(state.hwInputs.height);
    const weight = parseNumeric(state.hwInputs.weight);
    if (height === null && weight === null) {
      state.hwResult = null;
      renderPanel();
      flashCalc(t('err_hw_empty'), panel?.querySelector('.asc-hw'));
      return;
    }

    let best = null;
    for (const row of rows) {
      let total = 0;
      let used = 0;
      if (height !== null && row.height) {
        total += rangeDistance(height, row.height);
        used += 1;
      }
      if (weight !== null && row.weight) {
        total += rangeDistance(weight, row.weight);
        used += 1;
      }
      if (used === 0) continue;
      const score = total / used;
      if (!best || score < best.score) best = { score, size: row.size };
    }

    if (!best) {
      state.hwResult = null;
      renderPanel();
      flashCalc(t('err_hw_no_row'), panel?.querySelector('.asc-hw'));
      return;
    }

    const tableRows = Array.isArray(current.rows) ? current.rows : [];
    state.hwResult = {
      size: best.size,
      row: tableRows.findIndex((row) => String(row?.[0] ?? '').trim() === best.size),
    };
    renderPanel();
  }

  function rangeDistance(value, range) {
    if (value < range[0]) return range[0] - value;
    if (value > range[1]) return value - range[1];
    return 0;
  }

  function tableMarkup(table, highlightRow) {
    const columns = Array.isArray(table.columns) ? table.columns : [];
    const rows = Array.isArray(table.rows) ? table.rows : [];
    const systemColumn = systemColumnIndex(table, state.system);

    return `
      <div class="asc-table-wrap">
        <table class="asc-table">
          <thead>
            <tr>
              ${columns.map((column, index) => `<th class="${index === systemColumn ? 'is-system' : ''}">
                ${esc(columnLabel(table, column))}
                ${table.units && table.units[column] ? `<span class="asc-unit">(${esc(UNITS[table.units[column]] ? state.unit : table.units[column])})</span>` : ''}
              </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, rowIndex) => `
              <tr class="asc-row ${highlightRow === rowIndex ? 'is-current' : ''}">
                ${columns.map((column, columnIndex) => `<td class="${columnIndex === systemColumn ? 'is-system' : ''}">${esc(displayCell(row[columnIndex], table.units?.[column]))}</td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${rows.length === 0 ? `<p class="asc-empty">${esc(t('empty_table'))}</p>` : ''}
    `;
  }

  // ── Find my size ─────────────────────────────────────────────────────────

  function calculate() {
    const table = activeTable();
    const columns = measurementColumns(table);
    const entered = columns
      .map((column) => ({ column, value: Number.parseFloat(String(state.inputs[column.index] ?? '').replace(',', '.')) }))
      .filter((entry) => Number.isFinite(entry.value));

    if (entered.length === 0) {
      state.result = null;
      flashCalc(t('err_no_measurement'));
      return;
    }

    let best = null;
    (table.rows ?? []).forEach((row, rowIndex) => {
      let total = 0;
      let used = 0;
      for (const { column, value } of entered) {
        const range = displayRange(row[column.index], table.units?.[column.name]);
        if (!range) continue;
        const distance = value < range[0] ? range[0] - value : value > range[1] ? value - range[1] : 0;
        total += distance;
        used += 1;
      }
      if (used === 0) return;
      const score = total / used + (entered.length - used) * 1000;
      if (!best || score < best.score) best = { score, rowIndex, row };
    });

    if (!best) {
      state.result = null;
      flashCalc(t('err_no_numeric'));
      return;
    }

    const systemColumn = systemColumnIndex(table, state.system);
    state.result = {
      row: best.rowIndex,
      size: String(best.row?.[0] ?? ''),
      systemValue: systemColumn >= 0 ? String(best.row?.[systemColumn] ?? '') : '',
    };
    renderPanel();
  }

  function flashCalc(message, container = panel?.querySelector('.asc-calc')) {
    if (!container) return;
    let hint = container.querySelector('.asc-calc-error');
    if (!hint) {
      hint = document.createElement('p');
      hint.className = 'asc-calc-error';
      container.append(hint);
    }
    hint.textContent = message;
    setTimeout(() => hint?.remove(), 3200);
  }

  function measurementColumns(table) {
    const columns = Array.isArray(table.columns) ? table.columns : [];
    const systemValues = Object.values(table.sizeSystemColumns ?? {}).map((value) => String(value).toLowerCase());
    return columns
      .map((name, index) => ({ name, index, unit: table.units?.[name] }))
      .filter((column) => column.index > 0 && UNITS[column.unit] && !systemValues.includes(column.name.toLowerCase()));
  }

  function systemColumnIndex(table, system) {
    if (!system) return -1;
    const mapped = table.sizeSystemColumns?.[system];
    const columns = Array.isArray(table.columns) ? table.columns : [];
    if (mapped) {
      const mappedIndex = columns.indexOf(mapped);
      if (mappedIndex >= 0) return mappedIndex;
    }
    const cleanSystem = String(system).trim().toUpperCase();
    return columns.findIndex((name) => {
      const clean = String(name).trim().toUpperCase();
      return clean === cleanSystem || clean.startsWith(`${cleanSystem} `) || clean.startsWith(`${cleanSystem}-`);
    });
  }

  // ── Variant highlight ────────────────────────────────────────────────────

  function variantContext(rootEl) {
    const meta = window.ShopifyAnalytics?.meta?.product;
    const input = document.querySelector('form[action*="/cart/add"] [name="id"], input[name="id"]');
    if (meta && input?.value) {
      const variant = (meta.variants ?? []).find((item) => String(item.id) === String(input.value));
      if (variant) {
        const names = Array.isArray(meta.options)
          ? meta.options.map((option) => (typeof option === 'string' ? option : option?.name ?? ''))
          : [];
        const values = Array.isArray(variant.options)
          ? variant.options
          : [variant.option1, variant.option2, variant.option3].filter((value) => value !== null && value !== undefined);
        if (values.length > 0) {
          return values.map((value, index) => ({ name: names[index] ?? '', value: String(value) }));
        }
      }
    }
    return currentVariantTitle(rootEl)
      .split(/[\/,|]/)
      .map((token) => token.trim())
      .filter((token) => token.length > 0 && token.length < 24)
      .map((value) => ({ name: '', value }));
  }

  function matchingTableIndex(context) {
    return chart.tables.findIndex((table) => {
      const condition = table?.variant;
      const option = String(condition?.option ?? '').trim().toLowerCase();
      const value = String(condition?.value ?? '').trim().toLowerCase();
      if (!option || !value) return false;
      return context.some((entry) => {
        if (String(entry.value ?? '').trim().toLowerCase() !== value) return false;
        return !entry.name || String(entry.name).trim().toLowerCase() === option;
      });
    });
  }

  function resolvedTableIndex(context) {
    const match = matchingTableIndex(context);
    if (match >= 0) return match;
    const fallback = chart.tables.findIndex((table) => !(table?.variant?.option && table?.variant?.value));
    return fallback >= 0 ? fallback : 0;
  }

  function findVariantRow(table, rootEl) {
    const tokens = currentVariantTitle(rootEl)
      .split(/[\/,|]/)
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token.length > 0 && token.length < 24);
    if (tokens.length === 0) return -1;

    const columns = Array.isArray(table.columns) ? table.columns : [];
    const systemValues = Object.values(table.sizeSystemColumns ?? {});
    const sizeColumns = [0, ...columns.map((name, index) => (systemValues.includes(name) ? index : -1)).filter((index) => index > 0)];

    return (table.rows ?? []).findIndex((row) => sizeColumns.some((index) => {
      const cell = String(row?.[index] ?? '').trim().toLowerCase();
      return cell && tokens.some((token) => cellMatches(cell, token));
    }));
  }

  function cellMatches(cell, token) {
    if (cell === token || token.split(/\s+/).includes(cell)) return true;
    const range = parseRange(cell);
    const value = Number.parseFloat(token);
    return Boolean(range) && Number.isFinite(value) && value >= range[0] && value <= range[1];
  }

  function currentVariantTitle(rootEl) {
    const meta = window.ShopifyAnalytics?.meta?.product;
    const input = document.querySelector('form[action*="/cart/add"] [name="id"]');
    if (meta?.variants && input?.value) {
      const variant = meta.variants.find((item) => String(item.id) === String(input.value));
      if (variant) return variant.public_title || variant.title || '';
    }
    return rootEl.dataset.variantTitle || '';
  }

  // ── Link placement ──────────────────────────────────────────────────────

  function placeNextToVariantPicker(button) {
    const selectors = [
      'variant-selects',
      'variant-radios',
      '.variant-picker',
      '[data-variant-picker]',
      'product-form select[name="id"]',
      'form[action*="/cart/add"] select[name="id"]',
    ];
    for (const selector of selectors) {
      const anchor = document.querySelector(selector);
      if (!anchor || anchor.closest('.asc')) continue;
      const target = anchor.matches('select')
        ? anchor.closest('.product-form__input, .selector-wrapper') ?? anchor
        : anchor;
      target.insertAdjacentElement('afterend', button);
      button.classList.add('asc-link-placed');
      return true;
    }
    return false;
  }

  function placeNearProductTitle(button, handle, placement) {
    if (!handle) return false;
    const path = `/products/${handle}`;
    const matchesProduct = (anchor) => {
      const pathname = anchor.pathname.replace(/\/+$/, '');
      return pathname.endsWith(path) || pathname === `${path}/index`;
    };
    const inCart = (anchor) => Boolean(anchor.closest('cart-items, form[action*="/cart"], .cart-items, [class*="cart-item"]'));
    const anchors = [...document.querySelectorAll('a[href*="/products/"]')].filter((anchor) => {
      if (!matchesProduct(anchor) || anchor.closest('.asc')) return false;
      return placement === 'cart' ? inCart(anchor) : !inCart(anchor);
    });
    for (const anchor of anchors) {
      const heading = anchor.closest('h1, h2, h3, h4, h5, h6, .card__heading, [class*="card__heading"], .product-title, [class*="product-title"]');
      const target = heading ?? anchor;
      if (target.dataset.ascLinkPlaced) continue;
      target.dataset.ascLinkPlaced = 'true';
      target.insertAdjacentElement('afterend', button);
      button.classList.add('asc-link-placed');
      if (placement === 'cart') button.classList.add('asc-link-cart');
      return true;
    }
    return false;
  }

  // ── Unit conversion ──────────────────────────────────────────────────────

  function displayCell(value, columnUnit) {
    if (!UNITS[columnUnit] || value === null || value === undefined || value === '') return value ?? '';
    const range = parseRange(value);
    if (!range) return value;
    const converted = range.map((number) => convert(number, columnUnit, state.unit));
    return converted[0] === converted[1]
      ? formatNumber(converted[0])
      : `${formatNumber(converted[0])}–${formatNumber(converted[1])}`;
  }

  function displayRange(value, columnUnit) {
    if (!UNITS[columnUnit]) return null;
    const range = parseRange(value);
    if (!range) return null;
    return range.map((number) => convert(number, columnUnit, state.unit));
  }

  function convert(value, from, to) {
    if (!UNITS[from] || !UNITS[to] || from === to) return value;
    return (value * UNITS[from]) / UNITS[to];
  }

  function parseRange(value) {
    if (typeof value === 'number') return [value, value];
    const text = String(value ?? '').trim();
    if (!text) return null;
    const parts = text.split(/[-–—]/).map((part) => Number.parseFloat(part.replace(',', '.')));
    if (parts.length === 0 || parts.some((number) => !Number.isFinite(number))) return null;
    return parts.length === 1 ? [parts[0], parts[0]] : [Math.min(...parts), Math.max(...parts)];
  }

  function formatNumber(value) {
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  refreshers.set(root, () => {
    const match = resolvedTableIndex(variantContext(root));
    if (match !== state.table) {
      state.table = match;
      state.inputs = {};
      state.result = null;
      state.hwResult = null;
    }
    if (!isOpen) return;
    state.result = null;
    renderPanel();
  });
}

function contrastColor(hex) {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!match) return '#ffffff';
  let value = match[1];
  if (value.length === 3) value = value.split('').map((char) => char + char).join('');
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.62 ? '#111111' : '#ffffff';
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked in some privacy modes; the preference is optional.
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

document.addEventListener('shopify:section:load', init);

function refreshVariant() {
  document.querySelectorAll('[data-asc-root][data-asc-ready]').forEach((root) => refreshers.get(root)?.());
}

document.addEventListener('variant:changed', refreshVariant);
document.addEventListener('variant:change', refreshVariant);
