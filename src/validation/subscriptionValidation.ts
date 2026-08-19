import { z } from "zod";
export const updateSubscriptionSchema = z.object({
  name: z.string().min(1).optional(),
  features: z.array(z.string()).optional(),
  pricing: z.array(
    z.object({
      durationMonths: z.number().positive(),
      price: z.number().positive(),
    })
  ).min(1).optional(),
});

export const subscribeToPlanSchema = z.object({
  subscriptionId: z.string().min(1, { error: "Plan is required" }),
  durationMonths: z.number().positive(),
});