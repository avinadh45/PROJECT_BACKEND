import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUserCreateRepository } from "../../interface/User/IUserCreateRepository";
import { AdminLoginDTO } from "../../dto/admin/adminLogindto";
import { AdminAuthResponseDTO } from "../../dto/admin/adminAuthResponsedto";
import { HttpStatus } from "../../enums/httpstatus";
import { AppError } from "../../utils/AppError";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { IAdminService } from "../../interface/Admin/IAdminService";
import { AdminMapper } from "../../mapper/admin/adminMapper";
import { MESSAGES } from "../../constants/message";
export class Adminservice implements IAdminService {
  constructor(private _userReadRepo: IUserCreateRepository) {}

  async login(data: AdminLoginDTO): Promise<AdminAuthResponseDTO> {
    
    const user = await this._userReadRepo.findUserByEmail(data.email);
    if (!user || user.role !== "admin") {
      throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND);
    }
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new AppError(MESSAGES.ADMIN.INVALID,HttpStatus.BAD_REQUEST);
    }
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: "admin",
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      role: "admin",
    });
    return AdminMapper.toAuthResponse(user, accessToken, refreshToken);
  }

  async refreshToken(token: string) {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    ) as { id: string };

    const user = await this._userReadRepo.findUserById(decoded.id);

    if (!user || user.role !== "admin") {
      throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND);
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: "admin",
    });

    return accessToken;
  }
 
}
