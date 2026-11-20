import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { loadCharts, loadProduct, saveOverride } from "./utils.js";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const { i18n } = shopify;
  const productId = shopify.data.selected?.[0]?.id ?? "";
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [shopId, setShopId] = useState("");
  const [locked, setLocked] = useState(false);
  const [charts, setCharts] = useState([]);
  const [initial, setInitial] = useState("");
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!productId) throw new Error(i18n.translate("missing_product"));
        const [loaded, chartList] = await Promise.all([loadProduct(productId), loadCharts()]);
        if (!active) return;
        setProduct(loaded.product);
        setShopId(loaded.shopId);
        setLocked(loaded.locked);
        setCharts(chartList);
        const current = loaded.product.metafield?.value ?? "";
        setInitial(current);
        setSelected(current);
        setStatus("ready");
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : i18n.translate("load_failed"));
        setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [productId]);

  const chartOptions = useMemo(() => {
    const options = charts.map((chart) => ({ value: chart.id, label: chart.name }));
    if (selected && !charts.some((chart) => chart.id === selected)) {
      options.unshift({ value: selected, label: i18n.translate("chart_missing") });
    }
    return options;
  }, [charts, selected]);

  const chartName = charts.find((chart) => chart.id === selected)?.name;
  const summary = selected
    ? String(i18n.translate("summary_override", { name: chartName ?? String(i18n.translate("chart_missing")) }))
    : String(i18n.translate("summary_rules"));
  const dirty = selected !== initial;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await saveOverride({ product, shopId, chartId: selected });
      setInitial(selected);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : i18n.translate("save_failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <s-admin-block heading={i18n.translate("heading")} collapsedSummary={status === "ready" ? summary : undefined}>
      <s-stack direction="block" gap="base">
        {status === "loading" && <s-spinner accessibilityLabel={i18n.translate("loading")} size="base" />}

        {status === "error" && (
          <s-banner heading={i18n.translate("error_heading")} tone="critical">
            <s-paragraph>{error}</s-paragraph>
          </s-banner>
        )}

        {status === "ready" && (
          <>
            {locked && (
              <s-banner heading={i18n.translate("locked_heading")} tone="warning">
                <s-paragraph>{i18n.translate("locked_body")}</s-paragraph>
              </s-banner>
            )}

            {saved && (
              <s-banner tone="success" dismissible={false}>
                <s-paragraph>{i18n.translate("saved")}</s-paragraph>
              </s-banner>
            )}

            {error && (
              <s-banner tone="critical" dismissible={false}>
                <s-paragraph>{error}</s-paragraph>
              </s-banner>
            )}

            <s-paragraph color="subdued">{i18n.translate("intro")}</s-paragraph>

            {charts.length === 0 && (
              <s-paragraph color="subdued">{i18n.translate("no_charts")}</s-paragraph>
            )}

            <s-select
              label={i18n.translate("chart_label")}
              value={selected}
              disabled={locked || saving}
              onChange={(event) => {
                setSelected(event.currentTarget.value);
                setSaved(false);
              }}
            >
              <s-option value="">{i18n.translate("no_override")}</s-option>
              {chartOptions.map((option) => (
                <s-option key={option.value} value={option.value}>
                  {option.label}
                </s-option>
              ))}
            </s-select>

            <s-stack direction="inline" gap="base" alignItems="center">
              <s-button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={locked || saving || !dirty}
              >
                {i18n.translate("save")}
              </s-button>
              <s-text color="subdued" type="strong">
                {summary}
              </s-text>
            </s-stack>
          </>
        )}
      </s-stack>
    </s-admin-block>
  );
}
