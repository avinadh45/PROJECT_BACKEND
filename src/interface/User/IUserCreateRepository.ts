
import { IUser } from "./userinterface";


export interface IUserCreateRepository{
    createUser(userData:Partial<IUser>): Promise<IUser>
    findUserByEmail(Email:string):Promise <IUser | null>;
    findUserById(id:string) : Promise<IUser | null>
    findUserByResetToken(token:string):Promise<IUser | null>
    getAllUser(page:number,limit:number,search:string):Promise<{users:IUser[];total:number}>
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
}
