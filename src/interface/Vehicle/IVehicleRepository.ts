import { Types } from "mongoose";
import { IVehicle } from "./IVehicle";

export interface IVehicleReadRepository {
  findById(id: string): Promise<IVehicle | null>;
  fingByUser(userId: string): Promise<IVehicle []>;
}
export interface IVehicleWriteRepository {
  create(data: Partial<IVehicle>): Promise<IVehicle >;
  update(id: string, data: Partial<IVehicle>): Promise<IVehicle | null>;
  delete(id: string): Promise<boolean>;
}
export interface IVehicleRepository
  extends IVehicleReadRepository, IVehicleWriteRepository {}
