import { PricingTierDTO } from "./subscriptionCreateDTO";

export interface SubscriptionUpdateDTO{
    name?:string;
    features?:string[];
    pricing?:PricingTierDTO[]
}