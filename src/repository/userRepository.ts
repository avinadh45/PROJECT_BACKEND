import { Model } from "mongoose";
import { IUser } from "../interface/User/userinterface";
import { IUserCreateRepository } from "../interface/User/IUserCreateRepository";
// import { IUserReadRepository } from "../interface/User/IUserReadRepository";
// import { IUserUpdateRepository } from "../interface/User/IUserUpdateRepository";
import { BaseRepository } from "./base/BaseRepository";
import User from "../model/Usermodel";


export class UserRepository
    extends BaseRepository<IUser>
    implements IUserCreateRepository{

    constructor(userModel: Model<IUser>) {
        super(userModel);
    }

    async createUser(userData: IUser): Promise<IUser> {
        return await this.create(userData);
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
    return await (this.model as any)
        .findOne({ email })
        .select("+password");
    }

    async findUserById(id: string): Promise<IUser | null> {
        return await this.findById(id);
    }

    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await this.updateById(id, updateData);
    }

    async findUserByResetToken(token: string): Promise<IUser | null> {
       return await this.findOne({ resetToken: token });
    }



    async getAllUser(page: number, limit: number,search:string = ""): Promise<{ users: IUser[]; total: number; }> {
        const skip = (page - 1) * limit
        const query: Record<string, any> = search? {
      role: "user",
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }
  : { role: "user" };
        const users = await User.find(query).skip(skip).limit(limit)
        const total = await User.countDocuments({role:"user"})
        return ({ users,total})
    }

  async updateById(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
      return await User.findByIdAndUpdate(id,updateData,{returnDocument:"after"})
  }
}
