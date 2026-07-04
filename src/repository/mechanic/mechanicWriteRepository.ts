
import UserModel from "../../model/Usermodel";
import { IMechanicWriteRepository } from "../../interface/Machanic/IMechanicWriteRepository";
import { IMechanic } from "../../interface/Machanic/machanicinterface";
import { IUser } from "../../interface/User/userinterface";

export class MechanicWriteRepository implements IMechanicWriteRepository {

  async create(data: Partial<IMechanic>): Promise<IMechanic> {
    const mechanic = await UserModel.create({
      ...data,
      role: "mechanic",
      isBlocked: false
    });

    return mechanic.toObject() as IMechanic;
  }

  async save(user: IMechanic): Promise<IMechanic> {
    const updated = await UserModel.findByIdAndUpdate(
      user._id,
      user,
      { new: true }
    );

    return updated?.toObject() as IMechanic;
  }
  async update(id: string, updatedata: Partial<IMechanic>): Promise<IMechanic | null> {
      return await UserModel.findByIdAndUpdate(id,updatedata,{returnDocument:"after"})
  }
}