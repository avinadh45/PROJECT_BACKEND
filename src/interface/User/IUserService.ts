import { IUser } from "./userinterface";
import { UserRegisterDTO } from "../../dto/user/RegisterDTO";
import { userResponseDTO } from "../../dto/user/ResponseDTO";
import { ForgotPasswordDTO } from "../../dto/user/ForgotpasswordDTO";
import { VerifyOtpDTO } from "../../dto/user/OtpDto";
import { LoginDTO } from "../../dto/user/LoginDTO";
import { ResetPasswordDTO } from "../../dto/user/RestpasswordDTO";
import { GoogleLoginDTO } from "../../dto/user/googleDTO";
import { userListDTO } from "../../dto/admin/userListDTO";
import { userDetailsDTO } from "../../dto/admin/userDetail";
import { PaginatedResponse } from "../common/pagination";
export interface IUserService{
    registerUser(userData:UserRegisterDTO): Promise<userResponseDTO>
    verifyOtp(dto:VerifyOtpDTO):Promise<boolean>
    loginUser(userDate:LoginDTO): Promise<userResponseDTO>
    refreshToken(token: string): Promise<{ accessToken: string }>
    resendOtp(email:string):Promise<void>
    forgotPassword(email: ForgotPasswordDTO): Promise<void>
    resetPassword(dto:ResetPasswordDTO):Promise<void>
    googleLogin(dto:GoogleLoginDTO): Promise<userResponseDTO>
    userList(page:number,limit:number,search:string):Promise<PaginatedResponse<userListDTO>>
    getUser(id:string):Promise<userDetailsDTO>
    block(id:string):Promise<userDetailsDTO>
    

}