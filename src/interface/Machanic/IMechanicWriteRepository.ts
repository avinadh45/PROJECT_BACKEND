import { IMechanic } from "./machanicinterface";
import { IUser } from "../User/userinterface";
export interface IMechanicWriteRepository{
    create (data:Partial<IUser>):Promise<IMechanic>
    save(user:IMechanic):Promise<IMechanic>
    update(id:string,updatedata:Partial<IMechanic>):Promise<IMechanic | null>
}