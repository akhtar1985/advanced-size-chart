export type PlanStatus = 'free' | 'trial' | 'pro' | 'expired';

export interface BillingInfo {
  status: PlanStatus;
  trialDaysRemaining: number;   // 0 when not in trial
  trialEndsAt: string | null;   // ISO date string
  subscriptionId: string | null;
}

function gqlFetch(query: string, variables?: Record<string, unknown>) {
  return fetch('shopify:admin/api/2026-07/graphql.json', {
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  }).then(r => r.json());
}

export async function fetchBillingInfo(): Promise<BillingInfo> {
  const json = await gqlFetch(`#graphql
    query BillingInfo {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
          trialDays
          currentPeriodEnd
          createdAt
        }
      }
    }`);

  const subs: any[] = json.data?.currentAppInstallation?.activeSubscriptions ?? [];

  if (subs.length === 0) {
    return { status: 'free', trialDaysRemaining: 0, trialEndsAt: null, subscriptionId: null };
  }

  const sub = subs[0];

  // Calculate trial days remaining
  const trialDays: number = sub.trialDays ?? 0;
  const createdAt = new Date(sub.createdAt);
  const trialEndsAt = trialDays > 0
    ? new Date(createdAt.getTime() + trialDays * 86400000)
    : null;
  const now = new Date();
  const trialDaysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000))
    : 0;

  const isActive = sub.status === 'ACTIVE';
  const inTrial = trialDaysRemaining > 0;

  let status: PlanStatus;
  if (!isActive) {
    status = 'expired';
  } else if (inTrial) {
    status = 'trial';
  } else {
    status = 'pro';
  }

  return {
    status,
    trialDaysRemaining,
    trialEndsAt: trialEndsAt?.toISOString() ?? null,
    subscriptionId: sub.id,
  };
}

export async function createProSubscription(returnUrl: string): Promise<string> {
  const json = await gqlFetch(`#graphql
    mutation CreateSubscription($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int) {
      appSubscriptionCreate(
        name: $name
        lineItems: $lineItems
        returnUrl: $returnUrl
        trialDays: $trialDays
        test: false
      ) {
        appSubscription { id status }
        confirmationUrl
        userErrors { field message }
      }
    }`,
    {
      name: 'Pro Plan',
      trialDays: 15,
      returnUrl,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: { amount: 9.99, currencyCode: 'USD' },
              interval: 'EVERY_30_DAYS',
            },
          },
        },
      ],
    },
  );

  const result = json.data?.appSubscriptionCreate;
  if (result?.userErrors?.length) {
    throw new Error(result.userErrors[0].message);
  }
  return result.confirmationUrl;
}

export async function cancelSubscription(id: string): Promise<void> {
  await gqlFetch(`#graphql
    mutation CancelSubscription($id: ID!) {
      appSubscriptionCancel(id: $id) {
        appSubscription { id status }
        userErrors { field message }
      }
    }`, { id });
}
