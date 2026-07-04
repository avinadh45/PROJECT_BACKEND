import { MechanicResponseDTO } from "./mechanicResponsedto"

export interface MechanicAuthResponseDTO {
  mechanic: MechanicResponseDTO
  accessToken: string
  refreshToken: string
}