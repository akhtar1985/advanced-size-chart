import {useBilling} from '../hooks/useBilling.js';

export default function TrialBanner() {
  const {status, trialDaysRemaining, loading} = useBilling();

  if (loading) return null;

  if (status === 'trial') {
    const urgent = trialDaysRemaining <= 3;
    return (
      <s-banner tone={urgent ? 'warning' : 'info'}>
        {urgent
          ? <>⚠️ <strong>{trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left</strong> on your free trial. <s-link href="/pricing">Subscribe now</s-link> to keep all Pro features.</>
          : <><strong>{trialDaysRemaining} days</strong> remaining on your free trial. <s-link href="/pricing">View plans</s-link></>
        }
      </s-banner>
    );
  }

  if (status === 'expired') {
    return (
      <s-banner tone="critical">
        Your free trial has ended. Pro features are hidden. <s-link href="/pricing">Subscribe to restore access</s-link>
      </s-banner>
    );
  }

  return null;
}
