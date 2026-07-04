
  import { CreateMechanicDTO } from "../../dto/mechanic/createMechanicdto"
  import { MechanicLoginDTO } from "../../dto/mechanic/mechanicLoginDTO"
  import { MechanicResponseDTO } from "../../dto/mechanic/mechanicResponsedto"
  import { MechanicAuthResponseDTO } from "../../dto/mechanic/mechanicAuthDTO"
  import { PaginatedResponse } from "../common/pagination"
// import { IMechanic } from "./machanicinterface"
  export interface IMechanicService {
    createMechanic(data: CreateMechanicDTO): Promise<MechanicResponseDTO>
    login(data:MechanicLoginDTO): Promise<MechanicAuthResponseDTO>
    getMechanics(garageId: string,pages:number,limit:number,search:string): Promise<PaginatedResponse<MechanicResponseDTO>>
    block(id:string):Promise<MechanicResponseDTO>
  }