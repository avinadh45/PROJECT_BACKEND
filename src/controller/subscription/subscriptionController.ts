import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ISubscriptionService } from "../../interface/subscription/ISubscriptionService";
import { sendSuccess } from "../../utils/apiResponse";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";

export class subscriptionController {
  constructor(private _subscriptionService: ISubscriptionService,
              
  ) {}

  createSubscription = asyncHandler(async (req: Request, res: Response) => {
    const subscription = await this._subscriptionService.createSubscription(
      req.body,
    );
    return sendSuccess(
      res,
      subscription,
      MESSAGES.SUBSCRIPTION.CREATED,
      HttpStatus.CREATED,
    );
  });

  listSubscription = asyncHandler(async(req:Request,res:Response)=>{

    const page = Number(req.query.page) || 1 
    const limit = Number(req.query.limit) || 5 
    const search = (req.query.search as string ) || ""

    const result = await this._subscriptionService.listSubscription(page,limit,search)
    return sendSuccess(res,result,MESSAGES.SUBSCRIPTION.SUBSCRIPTION_FETCH,HttpStatus.OK)

  })

  updateSubscription = asyncHandler(async(req:Request,res:Response)=>{

    const {id} = req.params 
    const result = await this._subscriptionService.updateSubscription(id as string,req.body)
    return sendSuccess(res,result,MESSAGES.SUBSCRIPTION.UPDATED,HttpStatus.OK)
  })

  deleteSubscription = asyncHandler(async(req:Request,res:Response)=>{

    const { id } = req.params 
    const deleted = await this._subscriptionService.deleteSubscription(id as string)
    return sendSuccess(res,deleted,MESSAGES.SUBSCRIPTION.DELETED_SUCCESSFULLY,HttpStatus.OK)
  })

  getSubscription = asyncHandler(async(req:Request,res:Response)=>{

    const serviceCenterId = req.serviceCenter?.id as string
    const result = await this._subscriptionService.getSubscription(serviceCenterId )
    return sendSuccess(res,result,MESSAGES.SUBSCRIPTION.SUBSCRIPTION_FETCH,HttpStatus.OK)
  })

  subscribeToPlane = asyncHandler(async(req:Request,res:Response)=>{

    const serviceCenterId = req.serviceCenter?.id as string 
    const result  = await this._subscriptionService.subscribeToPlane(serviceCenterId,req.body)
    return sendSuccess(res,result,MESSAGES.SERVICE_CENTER.SUBSCRIBED,HttpStatus.OK)
  })

  createPaymentOrder = asyncHandler(async(req:Request,res:Response)=>{

    const result = await this._subscriptionService.createPaymentOrder(req.body)
    return sendSuccess(res,result,MESSAGES.COMMON.ORDER_CREATE,HttpStatus.OK)
  })

  verifyPaymentAndSubscription = asyncHandler(async(req:Request,res:Response)=>{

    const serviceCenterId = req.serviceCenter?.id as string
    const result = await this._subscriptionService.verifyPaymentAndSubscription(serviceCenterId,req.body)
    return sendSuccess(res,result,MESSAGES.SERVICE_CENTER.SUBSCRIBED,HttpStatus.OK)
  })
  
}
