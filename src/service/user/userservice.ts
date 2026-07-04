import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../enums/httpstatus";
import { IUserCreateRepository } from "../../interface/User/IUserCreateRepository";
import { PaginatedResponse } from "../../interface/common/pagination";
import { IUserService } from "../../interface/User/IUserService";
import { IOtpRepository } from "../../repository/otp/IOtpRepository";
import { IMailService } from "../mail/IMailService";
import { UserRegisterDTO } from "../../dto/user/RegisterDTO";
import { userResponseDTO } from "../../dto/user/ResponseDTO";
import { UserMapper } from "../../mapper/user/UserMapper";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { VerifyOtpDTO } from "../../dto/user/OtpDto";
import { LoginDTO } from "../../dto/user/LoginDTO";
import { ForgotPasswordDTO } from "../../dto/user/ForgotpasswordDTO";
import { ResetPasswordDTO } from "../../dto/user/RestpasswordDTO";
import { GoogleLoginDTO } from "../../dto/user/googleDTO";
import { userListDTO } from "../../dto/admin/userListDTO";
import { MESSAGES } from "../../constants/message";
import { logger } from "../../config/logger";
import { userDetailsDTO } from "../../dto/admin/userDetail";

export class UserService implements IUserService {
  constructor(
  
    private _userCreaterepo: IUserCreateRepository,
    private _otpRepo: IOtpRepository,
    private _mailService: IMailService,
  ) {}

  async registerUser(userData: UserRegisterDTO): Promise<userResponseDTO> {
    
    const existingUser = await this._userCreaterepo.findUserByEmail(
      userData.email,
    );
    if (existingUser && existingUser.isVerified) {
      throw new AppError(MESSAGES.USER.USER_EXIST,HttpStatus.CONFLICT);
    }

    if (existingUser && !existingUser.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await this._otpRepo.saveOtp(userData.email, otp, 300);
      await this._mailService.sendOtpMail(userData.email, otp);

      logger.info("resent",{email:userData.email,otp})

      throw new AppError(MESSAGES.USER.OTP,HttpStatus.CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = {
      ...userData,
      password: hashedPassword,
      isVerified: false,
    };
    const user = await this._userCreaterepo.createUser(newUser);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this._otpRepo.saveOtp(userData.email, otp, 300);
    await this._mailService.sendOtpMail(userData.email, otp);
    logger.info("otp",{otp})
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    return UserMapper.toAuthResponse(user, accessToken, refreshToken);
  }

  async verifyOtp(dto: VerifyOtpDTO): Promise<boolean> {
    const storedOtp = await this._otpRepo.getOtp(dto.email);

    logger.info("OTP fetched from Redis", {email: dto.email,});
    if (!storedOtp) {
      throw new AppError(MESSAGES.USER.OTP_EXPIRED,HttpStatus.BAD_REQUEST);
    }

    const enteredOtpStr = String(dto.otp).trim();
    const storedOtpStr = String(storedOtp).trim();

    

    if (storedOtpStr !== enteredOtpStr) {
      throw new AppError(MESSAGES.USER.INVALID_OTP,HttpStatus.BAD_REQUEST);
    }

    const user = await this._userCreaterepo.findUserByEmail(dto.email);

    if (user) {
      await this._userCreaterepo.updateUser(user._id.toString(), {
        isVerified: true,
      });
    }

    await this._otpRepo.deleteOtp(dto.email);

    return true;
  }
  async loginUser(dto: LoginDTO): Promise<userResponseDTO> {
   
    const user = await this._userCreaterepo.findUserByEmail(dto.email);
    if (!user) {
      throw new AppError(MESSAGES.USER.NOT_FOUND,HttpStatus.NOT_FOUND);
    }
    if (user.isBlocked) {
      throw new AppError(MESSAGES.USER.BLOCK,HttpStatus.FORBIDDEN);
    }
    
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new AppError(MESSAGES.USER.INVALID_PASSWORD,HttpStatus.BAD_REQUEST);
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });
    return UserMapper.toAuthResponse(user, accessToken, refreshToken);
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    );
    const newAccessToken = generateAccessToken({id:decoded.id,role:decoded.role});
    return { accessToken: newAccessToken };
  }
  async resendOtp(email: string): Promise<void> {
    const user = await this._userCreaterepo.findUserByEmail(email);
    if (!user) {
      throw new AppError(MESSAGES.USER.NOT_FOUND,HttpStatus.NOT_FOUND);
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this._otpRepo.saveOtp(email, otp, 300);
    await this._mailService.sendOtpMail(email, otp);

  
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const user = await this._userCreaterepo.findUserByEmail(dto.email);

    if (!user) {
      throw new AppError(MESSAGES.USER.NOT_FOUND,HttpStatus.NOT_FOUND);
    }
    const token = crypto.randomBytes(30).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 10);
    await this._userCreaterepo.updateUser(user._id.toString(), {
      resetToken: token,
      resetTokenExpiry: expiry,
    });
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    await this._mailService.sendResetPasseord(dto.email, resetLink);
  }

  async resetPassword(dto: ResetPasswordDTO): Promise<void> {
    const user = await this._userCreaterepo.findUserByResetToken(dto.token);

    if (!user) {
      throw new AppError(MESSAGES.USER.NOT_FOUND,HttpStatus.NOT_FOUND);
    }
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new AppError(MESSAGES.USER.EXPIRED,HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this._userCreaterepo.updateUser(user._id.toString(), {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

  }
  async googleLogin(data: GoogleLoginDTO): Promise<userResponseDTO> {
    let user = await this._userCreaterepo.findUserByEmail(data.email);

    if (!user) {
      user = await this._userCreaterepo.createUser({
        name: data.name,
        email: data.email,
        googleId: data.googleId,
      });
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      role: user.role,
    });

    return UserMapper.toAuthResponse(user, accessToken, refreshToken);
  }

  async userList(page:number,limit:number,search:string): Promise<PaginatedResponse<userListDTO>> {
    const { users , total} = await this._userCreaterepo.getAllUser(page,limit,search)
    
    const mappedUser = users.map(UserMapper.toUserList) 
   return { data:mappedUser,total,page,limit,totalPages:Math.ceil(total/limit)}
  }

  async getUser(id: string): Promise<userDetailsDTO> {
    const user = await this._userCreaterepo.findUserById(id);
    if (!user) {
      throw new AppError(MESSAGES.USER.NOT_FOUND,HttpStatus.NOT_FOUND);
    }
    return UserMapper.toUserDetailsDTP(user);
  }
  async block(id: string): Promise<userDetailsDTO> {
    const existingUser = await this._userCreaterepo.findUserById(id);
   
    if (!existingUser) {
      throw new AppError(MESSAGES.USER.NOT_FOUND,HttpStatus.NOT_FOUND);
    }
    const user = await this._userCreaterepo.updateUser(id, {
      isBlocked: !existingUser.isBlocked,
    });
    console.log("After:", user?.isBlocked);
    if (!user) {
      throw new AppError(MESSAGES.USER.FAILED_UPDATE,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return UserMapper.toUserDetailsDTP(user);
  }
}
