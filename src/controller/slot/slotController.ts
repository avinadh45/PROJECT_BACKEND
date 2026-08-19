import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ISlotService } from "../../interface/slot/ISlotService";
import { sendSuccess } from "../../utils/apiResponse";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";

export class SlotController {
  constructor(private _slotService: ISlotService) {}

  getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
    
    const { serviceCenterId} = req.params
    const { date } = req.query 
    const result = await this._slotService.getAvailableSlots(serviceCenterId as string,date as string)
    return sendSuccess(res,result,MESSAGES.SLOT.FETCHED_SUCCESSFULLY,HttpStatus.OK)
  });

  blockSlot = asyncHandler(async(req:Request,res:Response)=>{

    const servicCenterId = req.serviceCenter?.id as string 
    const {date,time} = req.body
    const result = await this._slotService.blockSlot(servicCenterId,date,time) 
    return sendSuccess(res,result,MESSAGES.SLOT.BLOCKED_SLOT,HttpStatus.OK)
  })

  unBlockSlot = asyncHandler(async(req:Request,res:Response)=>{

    const servicCenterId = req.serviceCenter?.id as string 
    const { date,time } = req.body 
    const result = await this._slotService.unblockSlot(servicCenterId,date,time) 
    return sendSuccess(res,result,MESSAGES.SLOT.UNBLOCK_SLOT,HttpStatus.OK)
  })

  blockFullyDay = asyncHandler(async(req:Request,res:Response)=>{ 

    const servicCenterId = req.serviceCenter?.id as string 
    const { date } = req.body 
    const result = await this._slotService.blockFullDay(servicCenterId,date) 
    return sendSuccess(res,result,MESSAGES.SLOT.DAY_BLOCK,HttpStatus.OK)
  })
  unBlockFullDays = asyncHandler(async(req:Request,res:Response)=>{

    const serviceCenterId = req.serviceCenter?.id as string 
    const { date } = req.body 
    const result = await this._slotService.unBlockFullDay(serviceCenterId,date) 
    return sendSuccess(res,result,MESSAGES.SLOT.FULL_DAY_UNBLOCKED,HttpStatus.OK)
  })
}
