export default function InfoPage() {
  const features = [
    ['Size charts', 'Create unlimited size charts with cm/in units'],
    ['Presets', 'T-shirt, shirt, top, bottom, bra, panty, jeans, shoes, and more'],
    ['Find My Size', 'Calculator recommends the best size from measurements'],
    ['Assignment rules', 'Assign charts by collection, vendor, tag, or all products'],
    ['Markets', 'Default unit and size system per country'],
    ['CSV / JSON', 'Import and export all charts'],
    ['Billing', '15-day free trial, then Pro gating'],
    ['Themes', 'Works on Dawn and other Online Store 2.0 themes'],
  ];

  return (
    <s-page heading="App info">
      <s-section heading="Features">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
          {features.map(([title, desc], i) => (
            <div key={i} style="border:1px solid #e5e5e5;border-radius:8px;padding:12px">
              <s-heading>{title}</s-heading>
              <s-paragraph>{desc}</s-paragraph>
            </div>
          ))}
        </div>
      </s-section>

      <s-section heading="How to add a size chart">
        <s-paragraph>1. Go to Charts and create a chart (or use a preset).</s-paragraph>
        <s-paragraph>2. Edit sizes, units, and instructions, then save.</s-paragraph>
        <s-paragraph>3. Go to Rules to assign the chart to collections, vendors, or all products.</s-paragraph>
        <s-paragraph>4. In your Shopify theme editor, add the Size Chart app block to your product page template.</s-paragraph>
        <s-paragraph>5. Enable the Size Chart Floating Button app embed for a floating button.</s-paragraph>
      </s-section>

      <s-section heading="Demo">
        <s-paragraph>Open your storefront product page to see the size chart button in action.</s-paragraph>
      </s-section>
    </s-page>
  );
}