import mongoose from "mongoose"
import UserModel from "../../model/Usermodel"
import { IMechanic } from "../../interface/Machanic/machanicinterface"
import { IUser } from "../../interface/User/userinterface"
import { BaseRepository } from "../base/BaseRepository"
import { IMechanicReadRepository } from "../../interface/Machanic/IMechanicReadRepository"
import  { PaginatedResponse} from "../../interface/common/pagination"
export class MechanicReadRepository extends BaseRepository<IUser> implements IMechanicReadRepository {

  constructor(){
    super(UserModel)
  }
  async findByEmail(email: string): Promise<IMechanic | null> {
    return await UserModel.findOne({ email, role: "mechanic" }).lean() as IMechanic | null
  }

  async findByGarage(garageId: string,page:number,limit:number,search:string = ""): Promise<PaginatedResponse<IMechanic>> {
    const skip = (page - 1) * limit
     const filter: Record<string, any> = {
    role: "mechanic",
    garageId: new mongoose.Types.ObjectId(garageId),
    ...(search && {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }),
  };
    const data = await UserModel.find(filter).skip(skip).limit(limit).lean()
  
    const total = await UserModel.countDocuments(filter)
     return {
    data : data as IMechanic[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };

  }
  async findAvailableMechanic(garageId: string): Promise<IMechanic | null> {
    
   const filter : Record<string,any> = { role:"mechanic", garageId:new mongoose.Types.ObjectId(garageId),isBlocked:false}
   return await UserModel.findOne(filter).lean() as IMechanic | null 
  }

}

