import { Request, Response } from "express";
import { IServiceCenterService } from "../../interface/ServiceCenter/IServiceCenterService";
import { HttpStatus } from "../../enums/httpstatus";
import { ServiceCenterLogin } from "../../dto/serviceCenter/LoginDTO";
import { MESSAGES } from "../../constants/message";
import { ForgotPasswordDTO } from "../../dto/serviceCenter/forgotDTO";
import { ResetPasswordDTO } from "../../dto/serviceCenter/resetPassword";
import { IMechanicService } from "../../interface/Machanic/IMechanicservice";
import { serviceCenterRegisterSchema } from "../../validation/ServiceCenterValidation";
import { asyncHandler } from "../../utils/asyncHandler";
import { logger } from "../../config/logger";

export class ServiceCenterController {
  constructor(
    private _service: IServiceCenterService,
    private _mechanicService: IMechanicService,
  ) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    logger.info("Service center registration files received", {
   garageLicense: !!files?.garageLicense?.[0],ownerIdProof: !!files?.ownerIdProof?.[0],});
    const garageLicense = files?.garageLicense?.[0];

    const ownerIdProof = files?.ownerIdProof?.[0];

    const body = req.body;

    body.location = JSON.parse(body.location);
    body.servicesOffered = JSON.parse(body.servicesOffered);
    body.availability = JSON.parse(body.availability);
    body.providerProfile = {
      ownerName: body.ownerName,
      garageName: body.garageName,
      phone: body.phone,
      location: body.location,

      documents: {
        garageLicense: {
          url: garageLicense?.path,

          public_id: garageLicense?.filename,
        },
        ownerIdProof: {
          url: ownerIdProof?.path,

          public_id: ownerIdProof?.filename,
        },
      },
    };
    logger.info("Service center registration payload processed", {
  email: body.email,garageName: body.garageName,ownerName: body.ownerName,});


    const validation = serviceCenterRegisterSchema.safeParse(body);

if (!validation.success) {

   const formattedErrors:
      Record<string,string> = {};

   validation.error.issues.forEach((err)=>{

      const field =
         err.path.join(".");

      formattedErrors[field] =
         err.message;

   });

   return res.status(
      HttpStatus.BAD_REQUEST
   ).json({
      success:false,
      errors:formattedErrors
   });

}
    
    const serviceCenter = await this._service.register(body);
    res.cookie("scAccessToken", serviceCenter.accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE)
});
res.cookie("scRefreshToken", serviceCenter.refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge:Number(process.env.REFRESH_TOKEN_MAX_AGE)
});
    return res
      .status(HttpStatus.CREATED)
      .json({ success: true, data: serviceCenter });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const dto: ServiceCenterLogin = {email, password,};

    const serviceCenter = await this._service.login(dto);

    res.cookie("scAccessToken",serviceCenter.accessToken,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"lax",
      maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE)
    })
    res.cookie("scRefreshToken",serviceCenter.refreshToken,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite:"lax",
      maxAge:Number(process.env.REFRESH_TOKEN_MAX_AGE)
    })
    return res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.USER.LOGIN_SUCCESS,
      data:{serviceCenter:serviceCenter.serviceCenter}
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const data: ForgotPasswordDTO = req.body;
    await this._service.forgotpassword(data);
    res.status(HttpStatus.OK).json({
      message: MESSAGES.SERVICE_CENTER.FORGOT_PASSWORD,
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto: ResetPasswordDTO = req.body;
    await this._service.resetPassword(dto);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.SERVICE_CENTER.PASSWORD_CHANGE,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    
  const refreshToken = req.cookies.scRefreshToken

    if (!refreshToken) {
      return res.status(401).json({
        message: MESSAGES.SERVICE_CENTER.TOKEN_EXPIRED,
      });
    }

    const result = await this._service.refreshToken(refreshToken);
    res.cookie("scAccessToken",result.accessToken,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge : Number(process.env.ACCESS_TOKEN_MAX_AGE)
    })

     return res.json({success:true});
  });

  logout  = asyncHandler(async(req:Request,res:Response)=>{
    res.clearCookie("scAccessToken")
    res.clearCookie("scRefreshToken")
    res.status(HttpStatus.OK).json({success:true})
  })
  
  blockMechanic = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const mechanic = await this._mechanicService.block(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: MESSAGES.SERVICE_CENTER.BLOCK,
        data: mechanic,
      });
    },
  );

  getVerificationStatus = asyncHandler(async(req:Request,res:Response)=>{

    if(! req.serviceCenter){
      return res.status(HttpStatus.UNAUTHORIZED).json({success:false})
    }
    const serviceCenterId = req.serviceCenter?.id
    const data = await this._service.getVerifiStatus(serviceCenterId)
    return res.status(HttpStatus.OK).json({success:true,data})
  })
 editVerification = asyncHandler(async(req:Request,res:Response)=>{

  if(!req.serviceCenter){
    return res.status(HttpStatus.UNAUTHORIZED).json({success:false})
  }
  const data = await this._service.editVerification(req.serviceCenter.id)
  return res.status(HttpStatus.OK).json({success:true,data})
 })

updateVerification = asyncHandler(async (req: Request, res: Response) => {

    if (!req.serviceCenter) {
      return res.status(
        HttpStatus.UNAUTHORIZED
      ).json({
        success: false,
      });
    }
    const files = req.files as {
      [fieldname: string]:
        Express.Multer.File[];
    };

    const garageLicense =
      files?.garageLicense?.[0];

    const ownerIdProof =
      files?.ownerIdProof?.[0];

    const dto = {
      ...req.body,

      location: JSON.parse(
        req.body.location
      ),

      availability: JSON.parse(
        req.body.availability
      ),

      servicesOffered: JSON.parse(
        req.body.servicesOffered
      ),
    };
 
    const data =
      await this._service.updateVerification(
        req.serviceCenter.id,
        dto,
        garageLicense,
        ownerIdProof
      );

    return res.status(
      HttpStatus.OK
    ).json({
      success: true,
      data,
    });
  }
);
 
}
