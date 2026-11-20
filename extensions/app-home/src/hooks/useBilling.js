import {useState, useEffect, useCallback} from 'preact/hooks';
import {fetchBillingInfo} from '../../../../shared/models/billing';

// Module-level single in-flight promise so multiple components don't fire
// duplicate requests on the same render cycle.
let _promise = null;
let _cached = null;

async function load() {
  if (!_promise) {
    _promise = fetchBillingInfo().then(info => {
      _cached = info;
      _promise = null;
      return info;
    });
  }
  return _promise;
}

export function useBilling() {
  const [billing, setBilling] = useState(_cached);

  useEffect(() => {
    load().then(setBilling);
  }, []);

  const refresh = useCallback(() => {
    _cached = null;
    _promise = null;
    load().then(setBilling);
  }, []);

  const status = billing?.status ?? 'free';
  const isPro = status === 'pro' || status === 'trial';
  const isFree = status === 'free';
  const isExpired = status === 'expired';
  const trialDaysRemaining = billing?.trialDaysRemaining ?? 0;
  const loading = billing === null;

  return {billing, status, isPro, isFree, isExpired, trialDaysRemaining, loading, refresh};
}
