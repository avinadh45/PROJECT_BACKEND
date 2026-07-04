import { AdminDTO } from "../../dto/admin/adminAuthResponsedto";
import { AdminAuthResponseDTO } from "../../dto/admin/adminAuthResponsedto";
import { IUser } from "../../interface/User/userinterface";

export const AdminMapper={

   toDTO(user: IUser): AdminDTO {
    return {
      id: user._id.toString(),
      email: user.email,
      role: "admin"
    };
  },
   toAuthResponse(
    user: IUser,
    accessToken: string,
    refreshToken: string
  ): AdminAuthResponseDTO {
    return {
      admin: this.toDTO(user),
      accessToken,
      refreshToken
    };
  } 
}