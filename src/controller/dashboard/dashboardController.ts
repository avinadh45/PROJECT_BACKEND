import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { IDashboardService } from "../../interface/dashboard/IDashboardService";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

export class DashboardController { 

    constructor( private _service:IDashboardService){} 

    getSummay = asyncHandler( async(req:Request, res:Response)=>{ 

        const serviceCenterId = ( req as any).serviceCenter.id;
        const result = await this._service.getSummary(serviceCenterId)
        return sendSuccess( res,result,MESSAGES.DASHBOARD.DASHBOARD_SUMMARY,HttpStatus.OK) 
    } )

    getTrends = asyncHandler( async(req:Request, res:Response)=>{ 

        const serviceCenterId = (req as any).serviceCenter.id;
        const range = req.query.range === "month" ? "month" : "week";
        const result = await this._service.getTrends(serviceCenterId,range)
        return sendSuccess(res,result, MESSAGES.DASHBOARD.DASHBOARD_TREND,HttpStatus.OK)
    })

    getToday = asyncHandler(async(req:Request, res:Response)=>{ 

        const serviceCenterId = (req as any).servicCenterId.id;
        const result =await this._service.getToday(serviceCenterId);
        return sendSuccess(res,result,MESSAGES.DASHBOARD.TODAYS_BOOKING,HttpStatus.OK)

    })
}
