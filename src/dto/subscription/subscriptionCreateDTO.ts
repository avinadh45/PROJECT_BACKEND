export interface PricingTierDTO{
    durationMonths:number;
    price:number;
}
export interface SubscriptionCreateDTO{ 
    name:string;
    features:string[];
    pricing:PricingTierDTO[];
    status?:"active" | "inactive";
}