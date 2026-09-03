import { Request, Response } from "express";
import { IMechanicService } from "../../interface/Machanic/IMechanicservice";
import { HttpStatus } from "../../enums/httpstatus";
import { MESSAGES } from "../../constants/message";
import { asyncHandler } from "../../utils/asyncHandler";
import { logger } from "../../config/logger";

export class MechanicController {
  constructor(private mechanicService: IMechanicService) {}

  createMechanic = asyncHandler(async (req: Request, res: Response) => {
    let serviceCenterId = (req as any).serviceCenter?.id;
    if (!serviceCenterId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.COMMON.UNAUTHORIZED,
      });
    }
    const data = { ...req.body, garageId: serviceCenterId };
    const serviceCenter = await this.mechanicService.createMechanic(data);
    return res
      .status(HttpStatus.CREATED)
      .json({ success: true, data: serviceCenter });
  });
  getMechanic = asyncHandler(async (req: Request, res: Response) => {
    const serviceCenterId = (req as any).serviceCenter?.id;
    if (!serviceCenterId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.COMMON.UNAUTHORIZED,
      });
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = (req.query.search as string) || ""
    const mechanic = await this.mechanicService.getMechanics(
      serviceCenterId,
      page,
      limit,
      search
    );
    res.status(HttpStatus.OK).json({
      success: true,
      ...mechanic,
    });
  });

  loginMechanic = asyncHandler(async (req: Request, res: Response) => {
    logger.info("mech here");
    const { email, password } = req.body;
    const mechanic = await this.mechanicService.login({ email, password });
    res.cookie("mechanicAccessToken", mechanic.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("mechanicRefreshToken", mechanic.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HttpStatus.OK).json({
      success: true,
      data: {mechanic:mechanic.mechanic}
    });
  });
  getDashboard = asyncHandler(async(req:Request,res:Response)=>{
    return res.status(HttpStatus.OK).json({success:true})
  })
}
