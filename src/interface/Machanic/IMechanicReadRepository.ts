import { IMechanic } from "./machanicinterface"
import { IUser } from "../User/userinterface"
import { PaginatedResponse } from "../common/pagination"
export interface IMechanicReadRepository {
  findByEmail(email: string): Promise<IMechanic | null>
  findById(id: string): Promise<IUser | null>
  findByGarage(garageId: string,page:number,limit:number,search:string): Promise<PaginatedResponse<IMechanic>>
  findAvailableMechanic(garageId:string):Promise<IMechanic | null>  
}