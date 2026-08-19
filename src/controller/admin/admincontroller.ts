import { Request, Response } from "express";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { IAdminService } from "../../interface/Admin/IAdminService";
import { IServiceCenterService } from "../../interface/ServiceCenter/IServiceCenterService";
import { IUserService } from "../../interface/User/IUserService";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";

export class AdminController {
  constructor(
    private _adminService: IAdminService,
    private _userService: IUserService,
    private _serviceCenter: IServiceCenterService,
  ) {}

  Login = asyncHandler(async (req: Request, res: Response) => {
    const admin = await this._adminService.login(req.body);

    res.cookie("adminAccessToken", admin.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE)
    });

    res.cookie("adminRefreshToken", admin.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:Number(process.env.REFRESH_TOKEN_MAX_AGE)
    });
    return sendSuccess(res,{admin:admin.admin},MESSAGES.ADMIN.LOGIN_SUCCESS,HttpStatus.OK)
  });

  refreshToken = asyncHandler(async(req:Request,res:Response)=>{
    const refreshToken = req.cookies.adminRefreshToken;
    if(!refreshToken){
      throw new AppError(MESSAGES.ADMIN.TOKEN_REQUIRED,HttpStatus.UNAUTHORIZED)
    }
    const accessToken = await this._adminService.refreshToken(refreshToken)

    res.cookie("adminAccessToken",accessToken,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE)
    })
   return sendSuccess(res,null,MESSAGES.ADMIN.TOKEN_REFRESHED,HttpStatus.OK  )
  })

  userList = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = (req.query.search as string) || ""
    let result = await this._userService.userList(page, limit,search);
    return sendSuccess(res,result,MESSAGES.USER.FETCH_SUCCESS,HttpStatus.OK)
  });

  serviceCenterList = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search  = (req.query.search as string) || ""
    const serviceCenter = await this._serviceCenter.serviceCenterList(page,limit,search);
    return sendSuccess(res,serviceCenter,MESSAGES.SERVICE_CENTER.FETCH_SUCCESS,HttpStatus.OK)
  });

  userDetails = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const user = await this._userService.getUser(id);
      return sendSuccess(res,user,MESSAGES.USER.FETCH_SUCCESS,HttpStatus.OK)     
});

  blockUser = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const user = await this._userService.block(id);
      return sendSuccess(res,user,MESSAGES.USER.BLOCK,HttpStatus.OK)
    },
  );

  serviceCenterDetail = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const serviceCenter = await this._serviceCenter.getServiceCenter(id);
      return sendSuccess(res,serviceCenter,MESSAGES.SERVICE_CENTER.FETCH_SUCCESS,HttpStatus.OK)
    },
  ); 

  blockServiceCenter = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const serviceCenter = await this._serviceCenter.block(id);
      return sendSuccess(res,serviceCenter,MESSAGES.SERVICE_CENTER.BLOCK,HttpStatus.OK)
    },
  );

  getPendingServiceCenter = asyncHandler(async (req: Request, res: Response) => {
      const serviceCenter = await this._serviceCenter.getPendingServiceCenter();
     return sendSuccess(res,serviceCenter,MESSAGES.SERVICE_CENTER.FETCH_SUCCESS,HttpStatus.OK)
    },
  );

  getDashboard = asyncHandler(async(req:Request,res:Response)=>{
    return sendSuccess(res, null, "Dashboard loaded", HttpStatus.OK);
  })
  verifiServiceCenterDetails = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const data = await this._serviceCenter.getVerification(id);
      return sendSuccess(res,data,MESSAGES.SERVICE_CENTER.FETCH_SUCCESS,HttpStatus.OK)
    },
  );

  approveServiceCenter = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      await this._serviceCenter.acceptVerification(id);
      return sendSuccess(res,null,MESSAGES.SERVICE_CENTER.APPROVED,HttpStatus.OK)
    },
  );

  rejectServiceCenter = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      await this._serviceCenter.rejectVerification(id, rejectionReason);
      return sendSuccess(res, null, MESSAGES.SERVICE_CENTER.REJECT, HttpStatus.OK);
});
  logout = asyncHandler(async (req: Request, res: Response) => {
   res.clearCookie("adminAccessToken", { sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.clearCookie("adminRefreshToken", { sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  
     return sendSuccess(res, null, MESSAGES.ADMIN.LOGOUT_SUCCESS, HttpStatus.OK);;
  });
}