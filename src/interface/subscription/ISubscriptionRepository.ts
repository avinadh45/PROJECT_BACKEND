import { ISubscription } from "./subscriptionInterface"
export interface ISubscriptionCreateRepository{

    create(data:Partial<ISubscription>):Promise<ISubscription | null>
    updateById(id:string,data:Partial<ISubscription>):Promise<ISubscription | null>
    
}