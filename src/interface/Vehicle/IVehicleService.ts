import { IVehicle,IVehicleDocuments } from "./IVehicle";

export interface IVehicleService{ 
    addVehicle(data:Partial<IVehicle>): Promise<IVehicle>
}
