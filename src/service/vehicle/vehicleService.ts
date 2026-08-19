import { IVehicle } from "../../interface/Vehicle/IVehicle";
import { IVehicleService } from "../../interface/Vehicle/IVehicleService";
import { IVehicleWriteRepository } from "../../interface/Vehicle/IVehicleRepository";
import { IVehicleReadRepository } from "../../interface/Vehicle/IVehicleRepository";
import { HttpStatus } from "../../enums/httpstatus";
import { MESSAGES } from "../../constants/message";
import { AppError } from "../../utils/AppError";

export class VehicleSerice implements IVehicleService {
  constructor(private _vehicleWrite: IVehicleWriteRepository, 
              private _vehicleRead:IVehicleReadRepository
  ) {}

   async addVehicle(data: Partial<IVehicle>): Promise<IVehicle> {
    if (!data.userId) {
      throw new AppError(MESSAGES.USER.NOT_FOUND, HttpStatus.UNAUTHORIZED);
    }
    if (
      !data.documents?.POCDocument ||
      !data.documents.RCDocument ||
      !data.documents.vehicleImage
    ) {
      throw new AppError(
        MESSAGES.VEHICLE.VEHICLE_DOC_REQUIRED,HttpStatus.BAD_REQUEST,);
    }
    const vehicle = await this._vehicleWrite.create(data)
    return vehicle
  }

  async vehicleList(userId: string): Promise<IVehicle[]> {
    const vehicle = await this._vehicleRead.fingByUser(userId)
    return vehicle
  }

  async updateVehicle(id: string, userId:string, data: Partial<IVehicle>): Promise<IVehicle | null> {

    const vehicle = await this._vehicleRead.findById(id)
    if(!vehicle){
      throw new AppError(MESSAGES.VEHICLE.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    if(vehicle.userId.toString() !== userId.toString()){
      throw new AppError(MESSAGES.COMMON.UNAUTHORIZED,HttpStatus.FORBIDDEN)
    }

    if(data.documents){
      data.documents={
        ...vehicle.documents,
        ...data.documents
      }
    }
    const res = await this._vehicleWrite.update(id,data) 
    return res 
   
  }
  
  async getVehicle(id: string, userId: string): Promise<IVehicle> {
    
    const vehicle = await this._vehicleRead.findById(id)
    if(!vehicle){
      throw new AppError(MESSAGES.VEHICLE.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    if(vehicle.userId.toString() !== userId.toString()){
      throw new AppError(MESSAGES.COMMON.UNAUTHORIZED,HttpStatus.UNAUTHORIZED)
    }
    return vehicle
  }

  async DeleteVehicle(id: string, userId: string): Promise<Boolean> {
    
    const vehicle = await this._vehicleRead.findById(id)
    if(!vehicle){
      throw new AppError(MESSAGES.VEHICLE.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    if(!userId){
      throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    const data = await this._vehicleWrite.delete(id)
    return data
  }
}
