import {useState, useEffect} from 'preact/hooks';
import {fetchBillingInfo, createProSubscription, cancelSubscription} from '../../../../shared/models/billing';
import {useBilling} from '../hooks/useBilling.js';

export default function PricingPage() {
  const {billing, loading, refresh} = useBilling();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // PricingPage always re-fetches fresh on mount
  useEffect(() => { refresh(); }, []);

  async function handleUpgrade() {
    setBusy(true);
    setError('');
    try {
      const returnUrl = window.location.href;
      const confirmUrl = await createProSubscription(returnUrl);
      // Redirect to Shopify's payment confirmation page
      window.top.location.href = confirmUrl;
    } catch (e) {
      setError(e.message || 'Failed to start subscription. Please try again.');
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel your Pro subscription? You will lose access to Pro features at the end of the billing period.')) return;
    setBusy(true);
    setError('');
    try {
      await cancelSubscription(billing.subscriptionId);
      refresh();
    } catch (e) {
      setError(e.message || 'Failed to cancel. Please try again.');
    }
    setBusy(false);
  }

  if (loading) return <s-page heading="Plans"><s-spinner /></s-page>;

  const {status, trialDaysRemaining, trialEndsAt} = billing;
  const isPro = status === 'pro' || status === 'trial';
  const isExpired = status === 'expired';

  return (
    <s-page heading="Plans & Billing">

      {/* Current status banner */}
      {status === 'trial' && (
        <s-banner tone="info">
          You are on a free trial — <strong>{trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining</strong>.
          Your trial ends on {new Date(trialEndsAt).toLocaleDateString()}.
          Subscribe now to keep Pro features after the trial.
        </s-banner>
      )}
      {status === 'pro' && (
        <s-banner tone="success">
          You are on the <strong>Pro plan</strong>. All features are active.
        </s-banner>
      )}
      {isExpired && (
        <s-banner tone="critical">
          Your subscription has expired. Subscribe to restore Pro features.
        </s-banner>
      )}
      {error && <s-banner tone="critical">{error}</s-banner>}

      {/* Plan cards */}
      <s-section>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-top:8px">

          {/* Free plan */}
          <div style={cardStyle(status === 'free')}>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <strong style="font-size:18px">Free</strong>
              {status === 'free' && <span style={badgeStyle('#e5e5e5','#333')}>Current plan</span>}
            </div>
            <div style="font-size:28px;font-weight:700;margin-bottom:4px">$0</div>
            <div style="font-size:13px;color:#666;margin-bottom:16px">Forever free</div>
            <ul style={listStyle}>
              <li>✅ Up to 3 size charts</li>
              <li>✅ All display modes (modal, drawer, inline, accordion)</li>
              <li>✅ Unit toggle (cm / in)</li>
              <li>✅ Theme editor block &amp; embed</li>
              <li>❌ Assignment rules</li>
              <li>❌ Find My Size calculator</li>
              <li>❌ Unlimited charts</li>
            </ul>
          </div>

          {/* Pro plan */}
          <div style={cardStyle(isPro, true)}>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <strong style="font-size:18px">Pro</strong>
              {status === 'trial' && <span style={badgeStyle('#fef3c7','#92400e')}>Trial — {trialDaysRemaining}d left</span>}
              {status === 'pro'   && <span style={badgeStyle('#d1fae5','#065f46')}>Active</span>}
              {isExpired          && <span style={badgeStyle('#fee2e2','#991b1b')}>Expired</span>}
            </div>
            <div style="font-size:28px;font-weight:700;margin-bottom:4px">$9.99<span style="font-size:14px;font-weight:400">/month</span></div>
            <div style="font-size:13px;color:#666;margin-bottom:16px">15-day free trial, cancel anytime</div>
            <ul style={listStyle}>
              <li>✅ Everything in Free</li>
              <li>✅ Unlimited size charts</li>
              <li>✅ Assignment rules (collection, vendor, tag, type)</li>
              <li>✅ Find My Size calculator</li>
              <li>✅ CSV / JSON export</li>
              <li>✅ Markets &amp; multi-language support</li>
              <li>✅ Priority support</li>
            </ul>

            {!isPro && (
              <button
                onClick={handleUpgrade}
                disabled={busy}
                style={upgradeBtn}
              >
                {busy ? 'Redirecting…' : 'Start 15-day free trial'}
              </button>
            )}
            {isPro && billing.subscriptionId && (
              <button
                onClick={handleCancel}
                disabled={busy}
                style={cancelBtn}
              >
                {busy ? 'Cancelling…' : 'Cancel subscription'}
              </button>
            )}
          </div>

        </div>
      </s-section>

      <s-section heading="FAQ">
        <s-stack gap="base">
          <div>
            <strong>What happens after the 15-day trial?</strong>
            <s-paragraph>You will be charged $9.99/month. If you don't subscribe, your account reverts to the Free plan (charts are kept, rules are paused).</s-paragraph>
          </div>
          <div>
            <strong>Can I cancel anytime?</strong>
            <s-paragraph>Yes. Cancel from this page and you keep Pro access until the end of the current billing period.</s-paragraph>
          </div>
          <div>
            <strong>Will my charts be deleted if I downgrade?</strong>
            <s-paragraph>No. All your charts are kept. Rules are paused and the calculator is hidden until you re-subscribe.</s-paragraph>
          </div>
        </s-stack>
      </s-section>

    </s-page>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function cardStyle(active, highlight = false) {
  return `
    padding:24px;
    border-radius:10px;
    border:2px solid ${active ? '#000' : highlight ? '#6366f1' : '#e5e5e5'};
    background:${highlight ? '#fafafa' : '#fff'};
    display:flex;
    flex-direction:column;
  `;
}

function badgeStyle(bg, color) {
  return `background:${bg};color:${color};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600`;
}

const listStyle = `
  list-style:none;
  padding:0;
  margin:0 0 20px;
  display:flex;
  flex-direction:column;
  gap:8px;
  font-size:14px;
  flex:1;
`;

const upgradeBtn = `
  width:100%;
  padding:12px;
  background:#000;
  color:#fff;
  border:none;
  border-radius:6px;
  font-size:15px;
  font-weight:600;
  cursor:pointer;
  margin-top:auto;
`;

const cancelBtn = `
  width:100%;
  padding:10px;
  background:none;
  color:#c00;
  border:1px solid #c00;
  border-radius:6px;
  font-size:13px;
  cursor:pointer;
  margin-top:auto;
`;
