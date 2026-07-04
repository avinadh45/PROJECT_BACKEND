import { MechanicResponseDTO } from "../../dto/mechanic/mechanicResponsedto";
import { CreateMechanicDTO } from "../../dto/mechanic/createMechanicdto";
import { IUser } from "../../interface/User/userinterface";
import { IMechanic } from "../../interface/Machanic/machanicinterface";
export class MachanicMapper{
   
  static toEntity(dto:CreateMechanicDTO): Partial<IMechanic> {
    return{
      name:dto.name,
      email:dto.email,
      password:dto.password,
      role:"mechanic",
      garageId:dto.garageId,
      isBlocked:false 
    }
  }
  static toResponse(entity:IMechanic): MechanicResponseDTO {
    return {
      id: entity._id.toString(),
      email:entity.email,
      garageId:entity.garageId!,
      name:entity.name,
      isBlocked:entity.isBlocked ?? false

    }
  }
}