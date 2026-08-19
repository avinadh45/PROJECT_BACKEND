export interface ServiceCenterSubscriptionStatusDTO {
  hasActiveSubscription: boolean;
  subscription: {
    planId: string;
    planName: string;
    tier: { durationMonths: number; price: number };
    startDate: Date;
    expiryDate: Date;
    status: "active" | "expired";
  } | null;
}