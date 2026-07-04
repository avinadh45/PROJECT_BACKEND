import { IServiceCenter } from "./IServiceCenter";
import { PaginatedResponse } from "../common/pagination";

export interface    IServiceCenterRepository{
    
    findByEmail(email:string):Promise<IServiceCenter | null>
    createServiceCenter(data:Partial<IServiceCenter>): Promise< IServiceCenter>
    findServiceCenterByToken(token:string):Promise<IServiceCenter | null>
    findById(id:string):Promise<IServiceCenter | null>
    findAll(page:number,limit:number,search:string):Promise<PaginatedResponse<IServiceCenter>>
    updateServiceCenter(id:string,data:Partial<IServiceCenter>):Promise<IServiceCenter | null>
    findPendingServiceCenter():Promise<IServiceCenter[]>
   
}
