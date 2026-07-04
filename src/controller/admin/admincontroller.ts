import { Request, Response } from "express";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { IAdminService } from "../../interface/Admin/IAdminService";
import { IServiceCenterService } from "../../interface/ServiceCenter/IServiceCenterService";
import { IUserService } from "../../interface/User/IUserService";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";

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
    return res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.ADMIN.LOGIN_SUCCESS,
      data:{
        admin:admin.admin
      }
    });
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
    res.json({success:true})
  })

  userList = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = (req.query.search as string) || ""
    let user = await this._userService.userList(page, limit,search);
    return res.status(HttpStatus.OK).json({ success: true, ...user });
  });

  serviceCenterList = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search  = (req.query.search as string) || ""
    const serviceCenter = await this._serviceCenter.serviceCenterList(page,limit,search);
    return res.status(HttpStatus.OK).json({ success: true, ...serviceCenter });
  });

  userDetails = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const user = await this._userService.getUser(id);
      return res
        .status(HttpStatus.OK)
        .json({
          success: true,
          message: MESSAGES.USER.FETCH_SUCCESS,
          data: user,
        });
    },
  );

  blockUser = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const user = await this._userService.block(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: MESSAGES.USER.BLOCK,
        data: user,
      });
    },
  );

  serviceCenterDetail = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const serviceCenter = await this._serviceCenter.getServiceCenter(id);
      return res
        .status(HttpStatus.OK)
        .json({
          success: true,
          message: MESSAGES.SERVICE_CENTER.FETCH_SUCCESS,
          data: serviceCenter,
        });
    },
  );

  blockServiceCenter = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const serviceCenter = await this._serviceCenter.block(id);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: MESSAGES.SERVICE_CENTER.BLOCK,
        data: serviceCenter,
      });
    },
  );

  getPendingServiceCenter = asyncHandler(
    async (req: Request, res: Response) => {
      const serviceCenter = await this._serviceCenter.getPendingServiceCenter();
      res.status(HttpStatus.ACCEPTED).json({ success: true, serviceCenter });
    },
  );

  getDashboard = asyncHandler(async(req:Request,res:Response)=>{
    return res.status(HttpStatus.OK).json({success:true})
  })
  verifiServiceCenterDetails = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const data = await this._serviceCenter.getVerification(id);
      return res.status(HttpStatus.OK).json({ success: true, data });
    },
  );

  approveServiceCenter = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      await this._serviceCenter.acceptVerification(id);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: MESSAGES.SERVICE_CENTER.APPROVED });
    },
  );

  rejectServiceCenter = asyncHandler(
    async (req: Request<{ id: string }>, res: Response) => {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      await this._serviceCenter.rejectVerification(id, rejectionReason);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: MESSAGES.SERVICE_CENTER.REJECT });
    },
  );
  logout = asyncHandler(async (req: Request, res: Response) => {
   res.clearCookie("adminAccessToken", { sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.clearCookie("adminRefreshToken", { sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  
    res.status(HttpStatus.OK).json({
      success: true,
    });
  });
}