import { IVehicle } from "../../interface/Vehicle/IVehicle";
import { VehicleModel } from "../../model/vehicle";
import { IVehicleRepository } from "../../interface/Vehicle/IVehicleRepository";

export class VechileRepository implements IVehicleRepository{
    async findById(id: string): Promise<IVehicle | null> {
        return await VehicleModel.findById(id).lean()
    }
    async fingByUser(userId: string): Promise<IVehicle []> {
        return await VehicleModel.find({userId}).lean()
    }
    async create(data: Partial<IVehicle>): Promise<IVehicle> {
        const vehicle = new VehicleModel(data) 
        return await vehicle.save()
    }
    async update(id: string, data: Partial<IVehicle>): Promise<IVehicle | null> {
        return await VehicleModel.findByIdAndUpdate(
    id,
    { $set: data },
    { returnDocument: "after" } 
  ).lean();
    }
    async delete(id: string): Promise<boolean> {
        const result =  await VehicleModel.findByIdAndDelete(id)
        return !!result
    }
}
