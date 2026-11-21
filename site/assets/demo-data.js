/* Demo data for the static showcase. Mirrors the Liquid output shape:
   <script type="application/json" id="asc-data-<uid>"> + asc-settings-<uid>. */
(function () {
  var params = new URLSearchParams(location.search);
  var raw = (params.get('locale') || 'en').toLowerCase().replace('_', '-');
  var base = raw.split('-')[0];
  var locale = raw;
  if (base === 'zh') locale = 'zh-cn';
  else if (base === 'pt') locale = 'pt-br';
  else if (!raw.includes('-')) locale = base;

  var chart = {
    chartId: 'gid://shopify/Metaobject/demo',
    name: 'Everyday Tee Size Guide',
    defaultUnit: 'cm',
    sizeSystems: ['US'],
    fitNotes:
      'Measurements are body measurements, not garment measurements. If you are between sizes, choose the larger size for a relaxed fit.',
    measureInstructions:
      'Chest: around the fullest part, keeping the tape level. Waist: around the natural waistline. Hips: around the fullest part of the hips.',
    measureImage: 'assets/measure-tops.svg',
    translation: null,
    tables: [
      {
        name: 'Regular fit',
        variant: { option: 'Fit', value: 'Regular' },
        columns: ['Size', 'US', 'Chest', 'Waist', 'Hips'],
        rows: [
          ['XS', '0-2', 82, 62, 88],
          ['S', '4-6', 86, 66, 92],
          ['M', '8-10', 90, 70, 96],
          ['L', '12-14', 96, 76, 102],
          ['XL', '16-18', 102, 82, 108],
          ['2XL', '20-22', 108, 88, 114]
        ],
        units: { Chest: 'cm', Waist: 'cm', Hips: 'cm' },
        heightWeight: {
          heightUnit: 'cm',
          weightUnit: 'kg',
          rows: [
            { size: 'XS', heightMin: '150', heightMax: '158', weightMin: '45', weightMax: '53' },
            { size: 'S', heightMin: '158', heightMax: '164', weightMin: '52', weightMax: '60' },
            { size: 'M', heightMin: '164', heightMax: '170', weightMin: '58', weightMax: '68' },
            { size: 'L', heightMin: '170', heightMax: '176', weightMin: '66', weightMax: '77' },
            { size: 'XL', heightMin: '176', heightMax: '182', weightMin: '75', weightMax: '88' },
            { size: '2XL', heightMin: '182', heightMax: '190', weightMin: '86', weightMax: '100' }
          ]
        }
      },
      {
        name: 'Slim fit',
        variant: { option: 'Fit', value: 'Slim' },
        columns: ['Size', 'US', 'Chest', 'Waist', 'Hips'],
        rows: [
          ['XS', '0-2', 80, 60, 86],
          ['S', '4-6', 84, 64, 90],
          ['M', '8-10', 88, 68, 94],
          ['L', '12-14', 94, 74, 100],
          ['XL', '16-18', 100, 80, 106],
          ['2XL', '20-22', 106, 86, 112]
        ],
        units: { Chest: 'cm', Waist: 'cm', Hips: 'cm' }
      }
    ]
  };

  var roots = document.querySelectorAll('[data-asc-demo]');
  Array.prototype.forEach.call(roots, function (root) {
    var uid = root.getAttribute('data-uid');
    var mode = root.getAttribute('data-mode') || 'modal';
    var variantTitle = root.getAttribute('data-variant-title') || 'Fit|Regular|M';
    var settings = {
      buttonText: 'Size guide',
      displayMode: mode,
      chartId: 'gid://shopify/Metaobject/demo-' + uid,
      defaultUnit: 'cm',
      defaultSizeSystem: 'US',
      primaryColor: root.getAttribute('data-primary') || '#111111',
      borderRadius: '10px',
      position: 'bottom-right',
      showCalculator: true,
      showFeedback: true,
      locale: locale,
      marketUnit: 'cm',
      marketSizeSystem: 'US'
    };

    var data = document.createElement('script');
    data.type = 'application/json';
    data.id = 'asc-data-' + uid;
    data.textContent = JSON.stringify(chart);
    root.parentNode.insertBefore(data, root);

    var conf = document.createElement('script');
    conf.type = 'application/json';
    conf.id = 'asc-settings-' + uid;
    conf.textContent = JSON.stringify(settings);
    root.parentNode.insertBefore(conf, root);

    root.className = 'asc';
    root.setAttribute('data-asc-root', '');
    root.setAttribute('data-variant-title', variantTitle);
  });

  var swatch = document.querySelector('[data-locale-current]');
  if (swatch) {
    var labels = { en: 'English', fr: 'Français', de: 'Deutsch', es: 'Español', it: 'Italiano', ja: '日本語', 'zh-cn': '简体中文', 'pt-br': 'Português (BR)' };
    swatch.textContent = labels[locale] || 'English';
  }
  document.querySelectorAll('[data-locale-link]').forEach(function (link) {
    var target = link.getAttribute('data-locale-link');
    var url = new URL(location.href);
    if (target === 'en') url.searchParams.delete('locale');
    else url.searchParams.set('locale', target);
    link.setAttribute('href', url.pathname + url.search + url.hash);
  });
})();
