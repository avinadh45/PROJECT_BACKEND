import { IUser } from "../../interface/User/userinterface";
import { UserRegisterDTO } from "../../dto/user/RegisterDTO";
import { userResponseDTO } from "../../dto/user/ResponseDTO";
import { userListDTO } from "../../dto/admin/userListDTO";
import { userDetailsDTO } from "../../dto/admin/userDetail";

export class UserMapper {
  static toEntity(dto: UserRegisterDTO): Partial<IUser> {
    return {
      name: dto.name,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: dto.password,
      role: "user",
      isBlocked: false,
    };
  }
  static toAuthResponse(
    user: IUser,
    accessToken: string,
    refreshToken: string,
  ): userResponseDTO {
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
  static toUserList(user: IUser):userListDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNumber:user.phoneNumber,
      role: user.role,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    };
  }
  static toUserDetailsDTP(user:IUser):userDetailsDTO{
    return{
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    }
  }
}
