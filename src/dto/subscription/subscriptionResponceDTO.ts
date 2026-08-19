import { PricingTierDTO } from "./subscriptionCreateDTO";

export interface SubscriptionResponseDTO{ 

    id:string;
    name:string;
    features:string[];
    pricing:PricingTierDTO[];
    status:"active" | "inactive";
    createdAt:Date;
    updatedAt:Date;
}