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
import { sendSuccess } from "../../utils/apiResponse";
import { ICategoryReadRepository } from "../../interface/category/ICategoryRepository";
import { AddServiceDTO } from "../../dto/serviceCenter/addServiceDTO";

export class ServiceCenterController {
  constructor(
    private _service: IServiceCenterService,
    private _mechanicService: IMechanicService,) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
    logger.info("Service center registration files received", {
      garageLicense: !!files?.garageLicense?.[0],
      ownerIdProof: !!files?.ownerIdProof?.[0],
    });
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
      email: body.email,
      garageName: body.garageName,
      ownerName: body.ownerName,
    });

    const validation = serviceCenterRegisterSchema.safeParse(body);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};

      validation.error.issues.forEach((err) => {
        const field = err.path.join(".");

        formattedErrors[field] = err.message;
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        errors: formattedErrors,
      });
    }

    const serviceCenter = await this._service.register(body);
    res.cookie("scAccessToken", serviceCenter.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE),
    });
    res.cookie("scRefreshToken", serviceCenter.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
    });
    return sendSuccess(
      res,
      serviceCenter,
      MESSAGES.SERVICE_CENTER.REGISTER_SUCCESS,
      HttpStatus.CREATED,
    );
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const dto: ServiceCenterLogin = { email, password };

    const serviceCenter = await this._service.login(dto);

    res.cookie("scAccessToken", serviceCenter.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE),
    });
    res.cookie("scRefreshToken", serviceCenter.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
    });
    return sendSuccess(
      res,
      { serviceCenter: serviceCenter.serviceCenter },
      MESSAGES.SERVICE_CENTER.LOGIN_SUCCESS,
      HttpStatus.OK,
    );
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const data: ForgotPasswordDTO = req.body;
    await this._service.forgotpassword(data);
    return sendSuccess(
      res,
      null,
      MESSAGES.SERVICE_CENTER.FORGOT_PASSWORD,
      HttpStatus.OK,
    );
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const dto: ResetPasswordDTO = req.body;
    await this._service.resetPassword(dto);
    return sendSuccess(
      res,
      null,
      MESSAGES.SERVICE_CENTER.PASSWORD_CHANGE,
      HttpStatus.OK,
    );
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.scRefreshToken;

    if (!refreshToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({
          success: false,
          message: MESSAGES.SERVICE_CENTER.TOKEN_EXPIRED,
        });
    }

    const result = await this._service.refreshToken(refreshToken);
    res.cookie("scAccessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE),
    });

    return sendSuccess(res, null, "Token refreshed", HttpStatus.OK);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("scAccessToken");
    res.clearCookie("scRefreshToken");
    return sendSuccess(res, null, "Logged out successfully", HttpStatus.OK);
  });

  blockMechanic = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const mechanic = await this._mechanicService.block(id);
      return sendSuccess(
        res,
        mechanic,
        MESSAGES.SERVICE_CENTER.BLOCK,
        HttpStatus.OK,
      );
    },
  );

  getVerificationStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.serviceCenter) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false });
    }
    const serviceCenterId = req.serviceCenter?.id;
    const data = await this._service.getVerifiStatus(serviceCenterId);
    return sendSuccess(
      res,
      data,
      MESSAGES.SERVICE_CENTER.VERIFICATION_STATUS,
      HttpStatus.OK,
    );
  });

  editVerification = asyncHandler(async (req: Request, res: Response) => {
    if (!req.serviceCenter) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false });
    }
    const data = await this._service.editVerification(req.serviceCenter.id);
    return sendSuccess(
      res,
      data,
      MESSAGES.SERVICE_CENTER.VERIFICATION_STATUS,
      HttpStatus.OK,
    );
  });

  updateVerification = asyncHandler(async (req: Request, res: Response) => {
    if (!req.serviceCenter) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
      });
    }
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const garageLicense = files?.garageLicense?.[0];

    const ownerIdProof = files?.ownerIdProof?.[0];

    const dto = {
      ...req.body,

      location: JSON.parse(req.body.location),

      availability: JSON.parse(req.body.availability),

      servicesOffered: JSON.parse(req.body.servicesOffered),
    };

    const data = await this._service.updateVerification(
      req.serviceCenter.id,
      dto,
      garageLicense,
      ownerIdProof,
    );

    return sendSuccess(
      res,
      data,
      MESSAGES.SERVICE_CENTER.VERIFICATION_UPDATED,
      HttpStatus.OK,
    );
  });

  getServiceCenterWithService = asyncHandler(async(req:Request,res:Response)=>{ 
    const serviceCenterId = req.serviceCenter!.id
    const page = Number(req.query.page) || 1 
    const limit = Number(req.query.limit) || 5 
    const search = (req.query.search as string || "")
    const serviceCenter = await this._service.getServiceCenterServices(serviceCenterId,page,limit,search)
    return sendSuccess(res,serviceCenter,MESSAGES.SERVICE_CENTER.FETCH_SUCCESS,HttpStatus.OK)
  })

  updateServiceFee = asyncHandler(async(req:Request,res:Response)=>{
    const serviceCenterId = req.serviceCenter?.id as string
    const { serviceId,advanceFee} = req.body 
    const update = await this._service.updateServiceFee(serviceCenterId,{serviceId,advanceFee})
    return sendSuccess(res,update,MESSAGES.SERVICE_CENTER.FEE_UPDATE,HttpStatus.OK)
  })
  addService = asyncHandler(async(req:Request,res:Response)=>{

    const serviceCenterId = req.serviceCenter?.id as string
    const dto:AddServiceDTO = req.body
    const updated = await this._service.addService(serviceCenterId,dto)
    return sendSuccess(res,updated,MESSAGES.SERVICE_CENTER.SERVICE_ADDED,HttpStatus.CREATED)
  })

  getCategories = asyncHandler(async(req:Request,res:Response)=>{

    const categories = await this._service.getAvailableCategoryies()
    return sendSuccess(res,categories,MESSAGES.SERVICE_CENTER.FETCH_SUCCESS,HttpStatus.OK)
  })

  toggleServiceStatus = asyncHandler(async(req:Request<{serviceId:string}>,res:Response)=>{
    const serviceCenterId = req.serviceCenter?.id  as string
    const { serviceId} = req.params 

    const update = await this._service.toggleServiceStatus(serviceCenterId,serviceId)
    return sendSuccess(res,update,MESSAGES.SERVICE_CENTER.SERVICE_STATUS_UPDATE,HttpStatus.OK)
  })

  getProfile = asyncHandler(async(req:Request,res:Response)=>{
    
    const serviceCenterId = req.serviceCenter?.id as string 
    const serviceCenter = await this._service.getProfile(serviceCenterId) 
    return sendSuccess(res,serviceCenter,MESSAGES.SERVICE_CENTER.PROFILE_FETCHED,HttpStatus.OK)
  })

  updateAvailability = asyncHandler(async(req:Request,res:Response)=>{

    const serviceCenterId = req.serviceCenter?.id as string 
    const result = await this._service.updateAvailiability(serviceCenterId,req.body)
    return sendSuccess(res,result,MESSAGES.SERVICE_CENTER.AVIABILITY,HttpStatus.OK)
  })
}
