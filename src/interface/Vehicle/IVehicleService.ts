import { IVehicle,IVehicleDocuments } from "./IVehicle";

export interface IVehicleService{ 
    addVehicle(data:Partial<IVehicle>): Promise<IVehicle>
    vehicleList(userId:string):Promise<IVehicle[]>
    updateVehicle(id:string,userId:string,data:Partial<IVehicle>):Promise<IVehicle | null>
    getVehicle(id:string,userId:string):Promise<IVehicle>
    DeleteVehicle(id:string,userId:string):Promise<Boolean>
}

