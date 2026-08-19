import { BaseRepository } from "../base/BaseRepository";
import { Subscription } from "../../model/subscriptionModel";
import { ISubscription } from "../../interface/subscription/subscriptionInterface";
import { ISubscriptionCreateRepository } from "../../interface/subscription/ISubscriptionRepository";
import { ISubscriptionReadRepos } from "../../interface/subscription/ISubscriptionReadRepository";
import { SubscriptionResponseDTO } from "../../dto/subscription/subscriptionResponceDTO";
import { PaginatedResponse } from "../../interface/common/pagination";
import { ISubscriptionDeleteRepository } from "../../interface/subscription/ISubscriptionDeleteRepo";

export class SubscriptionRepository extends BaseRepository<ISubscription>
 implements ISubscriptionCreateRepository,ISubscriptionReadRepos,ISubscriptionDeleteRepository{

    constructor(){
        super(Subscription)
    }

  async  listSubscription(page: number, limit: number, search: string): Promise<PaginatedResponse<ISubscription>> {

        const skip = (page - 1 )*limit 
        const filter = search?{name:{$regex:search,$options:"i"}}:{};
        const [data,total] = await Promise.all([ this.model.find(filter).skip(skip).limit(limit).sort({createdAt:-1}),this.model.countDocuments() ])

        return { data,total,page,limit,totalPages:Math.ceil(total/limit)}
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id)
        return !!result
    }
   
}