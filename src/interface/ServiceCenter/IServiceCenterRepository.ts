import { IServiceCenter, ServiceOfferedInput } from "./IServiceCenter";
import { PaginatedResponse } from "../common/pagination";

export interface    IServiceCenterRepository{
    
    findByEmail(email:string):Promise<IServiceCenter | null>
    createServiceCenter(data:Partial<IServiceCenter>): Promise< IServiceCenter>
    findServiceCenterByToken(token:string):Promise<IServiceCenter | null>
    findById(id:string):Promise<IServiceCenter | null>
    findAll(page:number,limit:number,search:string):Promise<PaginatedResponse<IServiceCenter>>
    updateServiceCenter(id:string,data:Partial<IServiceCenter>):Promise<IServiceCenter | null>
    findPendingServiceCenter():Promise<IServiceCenter[]>
    findWithService(id:string,page:number,limmit:number,search:string):Promise<PaginatedResponse<any>>
    updateServiceFee(serviceCenterId:string,serviceId:string,advanceFee:number | null):Promise<IServiceCenter | null>
    addService(serviceCenterId:string,service:ServiceOfferedInput):Promise<IServiceCenter | null>
    checkExistingService(serviceCenterId:string,serviceId:string):Promise<boolean>
    toggleServiceStatus( serviceCenterId:string,serviceId:string,status:"active" | "inactive"):Promise<IServiceCenter | null>
}
