import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { IConcernService } from "../../interface/concern/IConcernService";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

export class ConcernController {
  constructor(private _concernService: IConcernService) {}

  createConcern = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    const files = req.files as {
      image?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };
    const imageUrl = files?.image?.[0]?.path;
    const videoUrl = files?.video?.[0]?.path;
    const result = await this._concernService.createConcern(userId, req.body, {
      imageUrl,
      videoUrl,
    });
    sendSuccess(
      res,
      result,
      MESSAGES.CONCERN.CONCERN_CREATED,
      HttpStatus.CREATED,
    );
  });

  getServiceCenterConcerns = asyncHandler(async(req:Request,res:Response)=>{

    const servicCenterId = (req as any).serviceCenter.id 
    const page = Number(req.query.page) || 1 
    const limit = Number(req.query.limit) || 10 
    const status = req.query.status as string | undefined 
    const result = await this._concernService.getServiceCenterConcerns(servicCenterId,page,limit,status)
    sendSuccess(res,result,MESSAGES.COMMON.FETCHED,HttpStatus.OK)
  })

  getDetails = asyncHandler(async(req:Request,res:Response)=>{

    const serviceCenterId = (req as any).serviceCenter.id 
    const { concernId } = req.params 
    console.log(serviceCenterId,concernId,"both in the controller");
    
    const result = await this._concernService.getConcernDetails(serviceCenterId,concernId as string) 
    sendSuccess(res,result,MESSAGES.COMMON.FETCHED,HttpStatus.OK)
  })

  respondToConcern = asyncHandler(async(req:Request,res:Response)=>{

    const serviceCenterId = (req as any).serviceCenter.id 
     const { concernId } = req.params 
    const result = await this._concernService.responceClient(serviceCenterId,concernId as string,req.body) 
    sendSuccess(res,result,MESSAGES.COMMON.FETCHED,HttpStatus.OK)
  })

  scheduleConcernVisit = asyncHandler(async(req:Request,res:Response)=>{

    const userId = (req as any).user.id;
    const { concernId } = req.params 
    const result = await this._concernService.scheduleConcernVisit(userId,concernId as string,req.body)
    sendSuccess(res,result,MESSAGES.CONCERN.SCHEDULE,HttpStatus.OK)
  })

  getUserConernDetails = asyncHandler(async(req:Request,res:Response)=>{

    const userId = (req as any).user.id;
    const { concernId } = req.params 
    const result = await this._concernService.getUserConcernDetail(userId,concernId as string)
    sendSuccess(res,result,MESSAGES.CONCERN.FETCHED,HttpStatus.OK)
  })
}
