import { Document,Types } from "mongoose";

export interface IVehicleDocuments{
    vehicleImage:string,
    RCDocument:string,
    POCDocument:string
}
export interface IVehicle{
    _id?:Types.ObjectId;
    userId:Types.ObjectId;
    vehicleType:string;
    brand:string;
    model:string;
    RegistrationNumber:string;
    RCNumber:string;
    FuelType:string;
    year:number;
    odometer:number;
    lastNotedKms:number;
    insuranceExpiryDate:Date;
    documents:IVehicleDocuments;
    createdAt?:Date;
    updatedAt?:Date;
}
export type IVehicleDocument = Omit<IVehicle, "_id"> & Document;