import {useBilling} from '../hooks/useBilling.js';

/**
 * Wraps any Pro-only UI.
 * - trial / pro  → renders children
 * - free / expired → renders upgrade wall
 * - loading       → renders null (no flash)
 */
export default function BillingGate({feature = 'This feature', children}) {
  const {isPro, isExpired, loading} = useBilling();

  if (loading) return null;
  if (isPro) return <>{children}</>;

  const expired = isExpired;
  const headline = expired ? 'Your trial has ended' : 'Pro feature';
  const sub = expired
    ? `Your 15-day free trial has ended. Subscribe to re-enable ${feature} and all Pro features.`
    : `${feature} is available on the Pro plan. Start your 15-day free trial — no credit card required until the trial ends.`;

  return (
    <s-page heading={headline}>
      <s-section>
        <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
          <s-grid justifyItems="center" maxInlineSize="480px" gap="base">

            <div style="font-size:48px;text-align:center">{expired ? '⏰' : '🔒'}</div>

            <s-stack alignItems="center" gap="tight">
              <s-heading>{headline}</s-heading>
              <s-paragraph>{sub}</s-paragraph>
            </s-stack>

            {/* Feature comparison table */}
            <div style="width:100%;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;font-size:14px">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:#f9f9f9;font-weight:600;padding:10px 12px;border-bottom:1px solid #e5e5e5">
                <span>Feature</span><span style="text-align:center">Free</span><span style="text-align:center">Pro</span>
              </div>
              {[
                ['Size charts',         'Up to 3',  'Unlimited'],
                ['Display modes',       '✅',        '✅'],
                ['Unit toggle cm/in',   '✅',        '✅'],
                ['Assignment rules',    '❌',        '✅'],
                ['Find My Size calc',   '❌',        '✅'],
                ['CSV / JSON export',   '❌',        '✅'],
                ['Markets support',     '❌',        '✅'],
                ['Priority support',    '❌',        '✅'],
              ].map(([feat, free, pro], i) => (
                <div key={i} style={`display:grid;grid-template-columns:1fr 1fr 1fr;padding:9px 12px;border-bottom:1px solid #f0f0f0;background:${i%2===0?'#fff':'#fafafa'}`}>
                  <span>{feat}</span>
                  <span style="text-align:center">{free}</span>
                  <span style="text-align:center">{pro}</span>
                </div>
              ))}
            </div>

            <div style="text-align:center">
              <div style="font-size:28px;font-weight:700;margin-bottom:4px">
                $9.99<span style="font-size:14px;font-weight:400">/month</span>
              </div>
              <div style="font-size:13px;color:#666;margin-bottom:16px">
                {expired ? 'Resume your subscription' : '15-day free trial · Cancel anytime'}
              </div>
              <s-button variant="primary" href="/pricing">
                {expired ? 'Resubscribe' : 'Start free trial'}
              </s-button>
            </div>

          </s-grid>
        </s-grid>
      </s-section>
    </s-page>
  );
}
