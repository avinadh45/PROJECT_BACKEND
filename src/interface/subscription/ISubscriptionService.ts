import { ISubscription } from "./subscriptionInterface";
import { SubscriptionCreateDTO } from "../../dto/subscription/subscriptionCreateDTO";
import { SubscriptionResponseDTO } from "../../dto/subscription/subscriptionResponceDTO";
import { PaginatedResponse } from "../common/pagination";
import { SubscriptionUpdateDTO } from "../../dto/subscription/updateDTO";
import { ServiceCenterSubscriptionStatusDTO } from "./IServiceCenterSubscriptionStatus";
import { SubscribeToPlaneDTO } from "../../dto/subscription/SubscribeToPlanDTO";
import { VerifyPaymentDTO } from "../../dto/subscription/VerifyPaymentDTO";

export interface ISubscriptionService{

    createSubscription(dto:SubscriptionCreateDTO):Promise<ISubscription>
    listSubscription(page:number,limit:number,search:string):Promise<PaginatedResponse<SubscriptionResponseDTO>>
    updateSubscription(id:string,data:SubscriptionUpdateDTO):Promise<SubscriptionResponseDTO >
    deleteSubscription(id:string):Promise<void>
    getSubscription(serviceCenterId:string):Promise<ServiceCenterSubscriptionStatusDTO>
    subscribeToPlane(serviceCenterId:string,dto:SubscribeToPlaneDTO):Promise<ServiceCenterSubscriptionStatusDTO>
    createPaymentOrder(dto:SubscribeToPlaneDTO):Promise<{orderId:string,amount:number,currency:string}>
    verifyPaymentAndSubscription(serviceCenterId:string,dto:VerifyPaymentDTO):Promise<ServiceCenterSubscriptionStatusDTO>
    
}