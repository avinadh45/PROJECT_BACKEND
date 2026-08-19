import { ISubscription } from "./subscriptionInterface";
import { PaginatedResponse } from "../common/pagination";
import { SubscriptionResponseDTO } from "../../dto/subscription/subscriptionResponceDTO";
export interface ISubscriptionReadRepos {

    findOne(filter:Record<string,any>):Promise<ISubscription | null >
    findById(id:string):Promise<ISubscription | null>
    listSubscription(page:number,limit:number,search:string):Promise<PaginatedResponse<ISubscription>>

}