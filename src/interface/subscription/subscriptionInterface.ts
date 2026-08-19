export interface IPricingTier{
    durationMonths:number;
    price:number;
}
export interface ISubscription{
    name:string;
    features:string[];
    pricing:IPricingTier[];
    status:"active"|"inactive";
}