import { Request, Response, NextFunction } from "express";
import { IAdminDashboardService } from "../../interface/dashboard/IAdminDashboardService";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { TrendRange } from "../../utils/adminDateRange";


export class AdminDashboardController{ 

    constructor ( private _adminDashboardService: IAdminDashboardService) {}

    getAttention = asyncHandler(async(req:Request,res:Response)=>{ 

        const data = await this._adminDashboardService.getAttention()

        sendSuccess(res,data,MESSAGES.DASHBOARD.DATA_FETCHED,HttpStatus.OK)
    })

    getSummary = asyncHandler( async(req:Request,res:Response)=>{

        const data = await this._adminDashboardService.getSummary()

        sendSuccess(res,data,MESSAGES.DASHBOARD.DATA_FETCHED,HttpStatus.OK)
    })

    getTrends = asyncHandler(async(req:Request,res:Response)=>{

        const range:TrendRange = req.query.range === "month" ? "month" : "week";

        const data = await this._adminDashboardService.getTrends(range) 
        sendSuccess(res,data,MESSAGES.DASHBOARD.DATA_FETCHED,HttpStatus.OK)
    })

     getVerification = asyncHandler(async(req:Request,res:Response)=>{

        const data = await this._adminDashboardService.getVerification()
        sendSuccess(res,data,MESSAGES.DASHBOARD.DATA_FETCHED,HttpStatus.OK)
     })
}
