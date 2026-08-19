import { Request, Response } from "express";
import { IUserService } from "../../interface/User/IUserService";
import { HttpStatus } from "../../enums/httpstatus";
import { OAuth2Client } from "google-auth-library";
import { UserRegisterDTO } from "../../dto/user/RegisterDTO";
import { ForgotPasswordDTO } from "../../dto/user/ForgotpasswordDTO";
import { VerifyOtpDTO } from "../../dto/user/OtpDto";
import { LoginDTO } from "../../dto/user/LoginDTO";
import { ResetPasswordDTO } from "../../dto/user/RestpasswordDTO";
import { asyncHandler } from "../../utils/asyncHandler";
import { MESSAGES } from "../../constants/message";
import { AppError } from "../../utils/AppError";
import { logger } from "../../config/logger";
import { sendSuccess } from "../../utils/apiResponse";

export class UserController {
  constructor(private _userService: IUserService) {}

  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  registerUser = asyncHandler(async (req: Request, res: Response) => {
    const dto: UserRegisterDTO = req.body;

    const register = await this._userService.registerUser(dto);

    return sendSuccess(res,register,MESSAGES.USER.REGITER,HttpStatus.OK)
  });

  Verifyotp = asyncHandler(
    async (req: Request, res: Response)=> {
      const dto: VerifyOtpDTO = req.body;
      logger.info("OTP verification requested", {email: dto.email,});
      const user = await this._userService.verifyOtp(dto);
      return sendSuccess(res,user,MESSAGES.USER.OTP_VERIFIED,HttpStatus.OK) 
});

  LoginUser = asyncHandler(async (req: Request, res: Response) => {
    const dto: LoginDTO = req.body;

    const user = await this._userService.loginUser(dto);

    res.cookie("accessToken",user.accessToken,{
      httpOnly:true,
      secure:process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge : Number(process.env.ACCESS_TOKEN_MAX_AGE)
    })
    res.cookie("refreshToken",user.refreshToken,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"strict",
      maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE)
    })
     return sendSuccess(res, { user: user.user }, MESSAGES.USER.LOGIN_SUCCESS, HttpStatus.OK);
  });

  refresnToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      throw new AppError("Refresh token required", HttpStatus.UNAUTHORIZED);
    }
    const result = await this._userService.refreshToken(refreshToken);
    res.cookie("accessToken",result.accessToken,{
      httpOnly:true,
      secure : process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE)
    })
  return sendSuccess(res,null,MESSAGES.USER.REFRESH_TOKEN,HttpStatus.OK)
  });


resendOtp = asyncHandler(async (req: Request,res: Response) => {
   const { email } = req.body;
   await this._userService.resendOtp(email);
   return sendSuccess(res,null,MESSAGES.USER.OTP,HttpStatus.OK)

});

 forgetPassword = asyncHandler(async(req: Request, res: Response)=> {
      const dto: ForgotPasswordDTO = req.body;
      await this._userService.forgotPassword(dto);
      return sendSuccess(res,null,MESSAGES.USER.RESET_LINK,HttpStatus.OK)
  })

  getdashboard = asyncHandler(async(req:Request,res:Response)=>{
    return sendSuccess(res,null,MESSAGES.USER.DASHBOARD,HttpStatus.OK)
  })
resetPassword = asyncHandler(async(req: Request, res: Response)=> {
      const dto: ResetPasswordDTO = req.body;
      await this._userService.resetPassword(dto);
      return sendSuccess(res,null,MESSAGES.USER.PASSWORD_REST,HttpStatus.OK)
  })
  googleLogin = asyncHandler(async (req: Request, res: Response) => {

   const { token } = req.body;

   const ticket = await this.client.verifyIdToken({ idToken: token,audience: process.env.Client_ID});

   const payload = ticket.getPayload();

   if (!payload) {
      throw new AppError(
         "Invalid Google token",
         HttpStatus.BAD_REQUEST
      );
   }

   const email = payload.email as string;
   const name = payload.name as string;
   const googleId = payload.sub as string;

   const user =await this._userService.googleLogin({email,  name,googleId});

      res.cookie("accessToken",user.accessToken,{
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE)
      })

      res.cookie("refreshToken", user.refreshToken,{
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge:  Number(process.env.REFRESH_TOKEN_MAX_AGE)
      })
  return sendSuccess(res, user.user, MESSAGES.USER.GOOGLE_LOGIN, HttpStatus.OK);

});
  async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken")
   return sendSuccess(res, null, MESSAGES.USER.LOGOUT_SUCCESS, HttpStatus.OK);
  }
}
