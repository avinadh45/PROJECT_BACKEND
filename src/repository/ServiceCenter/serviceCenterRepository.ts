import ServiceCenter from "../../model/ServiceCenterModel";
import { IServiceCenter } from "../../interface/ServiceCenter/IServiceCenter";
import { IServiceCenterRepository } from "../../interface/ServiceCenter/IServiceCenterRepository";
import { PaginatedResponse } from "../../interface/common/pagination";

export class ServiceCenterRepository implements IServiceCenterRepository{

    async findByEmail(email: string): Promise<IServiceCenter | null> {
        return ServiceCenter.findOne({email})
    }

    async   findServiceCenterByToken(token:string):Promise<IServiceCenter | null>{
        return await ServiceCenter.findOne({resetToken: token})
    }
    async createServiceCenter(data: Partial<IServiceCenter>): Promise<IServiceCenter> {
        return ServiceCenter.create(data)
    }
    async findAll(page:number,limit:number,search:string = ""):Promise<PaginatedResponse<IServiceCenter>>{

        const skip = (page - 1 )* limit 
        const query:Record<string,any> = search?{$or:[{email:{$regex:search,$options:"i"}},
            {"providerProfile.garageName": {$regex:search,$options:"i"}},
            {"providerProfile.ownerName":{$regex:search,$options:"i"}}
        ]}:{}
        const serviceCenter = await ServiceCenter.find(query).skip(skip).limit(limit).sort({createdAt: -1})
        const total = await ServiceCenter.countDocuments(query)
        return {data:serviceCenter,page,limit,total,totalPages:Math.ceil(total/limit)}
      
    }

    async findById(id: string): Promise<IServiceCenter | null> {
        return ServiceCenter.findById(id).populate("servicesOffered.serviceId")
    }
    async updateServiceCenter(id: string, data: Partial<IServiceCenter>): Promise<IServiceCenter | null> {
        return await ServiceCenter.findByIdAndUpdate(id,data,{returnDocument:"after"})
    }

    async findPendingServiceCenter(): Promise<IServiceCenter[]> {
        return await ServiceCenter.find({verificationStatus:"pending"}).sort({createdAt:-1})
    }
    
}