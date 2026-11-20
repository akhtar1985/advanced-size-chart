import {useState, useEffect} from 'preact/hooks';
import {fetchSettings, saveSettings, DEFAULT_SETTINGS} from '../../../../shared/models/sizeChart';

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const update = patch => setSettings(prev => ({...prev, ...patch}));

  async function handleSave() {
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <s-page heading="Settings"><s-spinner /></s-page>;

  return (
    <s-page heading="Settings">
      <s-button slot="primary-action" variant="primary" onClick={handleSave} loading={saving}>
        {saved ? 'Saved!' : 'Save settings'}
      </s-button>

      <s-section heading="Display defaults">
        <s-form-layout>
          <s-text-field
            label="Button text"
            value={settings.buttonText}
            onInput={e => update({buttonText: e.target.value})}
          />
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:4px">Display mode</label>
            <select
              style="padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:14px;width:100%"
              value={settings.displayMode}
              onInput={e => update({displayMode: e.target.value})}
            >
              <option value="modal">Modal</option>
              <option value="drawer">Side drawer</option>
              <option value="inline">Inline</option>
              <option value="accordion">Accordion</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:14px;font-weight:500;margin-bottom:4px">Default unit</label>
            <select
              style="padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:14px;width:100%"
              value={settings.defaultUnit}
              onInput={e => update({defaultUnit: e.target.value})}
            >
              <option value="cm">Centimetres (cm)</option>
              <option value="in">Inches (in)</option>
            </select>
          </div>
          <s-text-field
            label="Button color (hex)"
            value={settings.primaryColor}
            onInput={e => update({primaryColor: e.target.value})}
          />
          <s-text-field
            label="Border radius"
            value={settings.borderRadius}
            onInput={e => update({borderRadius: e.target.value})}
            helpText="e.g. 4px, 8px, 50%"
          />
        </s-form-layout>
      </s-section>

      <s-section heading="Theme editor">
        <s-paragraph>
          After creating charts and rules, go to your theme editor and add the <s-text fontWeight="bold">Size Chart</s-text> app block to your product page template, or enable the <s-text fontWeight="bold">Size Chart Floating Button</s-text> app embed.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}
