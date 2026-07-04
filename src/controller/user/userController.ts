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

export class UserController {
  constructor(private _userService: IUserService) {}

  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  registerUser = asyncHandler(async (req: Request, res: Response) => {
    const dto: UserRegisterDTO = req.body;

    const register = await this._userService.registerUser(dto);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: "success",
      data: register,
    });
  });

  Verifyotp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const dto: VerifyOtpDTO = req.body;
      logger.info("OTP verification requested", {email: dto.email,});
      const user = await this._userService.verifyOtp(dto);
      res.status(HttpStatus.OK).json({
        success: true,
        message: "otp verified successfully",
        data: user,
      });
    },
  );

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
    return res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.USER.LOGIN_SUCCESS,
      data:{
        user:user.user
      }
    });
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

    res.json({success:true});
  });


resendOtp = asyncHandler(async (req: Request,res: Response) => {

   const { email } = req.body;

   await this._userService.resendOtp(email);

   return res.status(HttpStatus.OK).json({
      success: true,
      message: "OTP resent successfully"
   });

});

 forgetPassword = asyncHandler(async(req: Request, res: Response)=> {
      const dto: ForgotPasswordDTO = req.body;
      await this._userService.forgotPassword(dto);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Rest link sent to email" });
  })

  getdashboard = asyncHandler(async(req:Request,res:Response)=>{
    return res.status(HttpStatus.OK).json({success:true})
  })
resetPassword = asyncHandler(async(req: Request, res: Response)=> {
    
      const dto: ResetPasswordDTO = req.body;
      await this._userService.resetPassword(dto);
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Password reset successfully",
      });
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
   res.status(HttpStatus.OK).json({
      success: true,
      message: "Google login success",
      data: user.user
   });

});
  async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken")
    res.status(HttpStatus.OK).json({success:true,MESSAGES:MESSAGES.USER.LOGOUT_SUCCESS})
  }
}
