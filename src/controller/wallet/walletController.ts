import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { IWalletService } from "../../interface/wallet/IWalletService";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";


export class WalletController { 

    constructor( private _walletService: IWalletService){}

    getMyWallet = asyncHandler(async(req:Request,res:Response)=>{

        const serviceCenterId = ( req as any).serviceCenter.id; 
        const page = Number(req.query.page) || undefined; 
        const limit = Number(req.query.limit) || undefined  

        const data = await this._walletService.getServiceCenterWallet(
            serviceCenterId,page,limit
        )
        sendSuccess(res,data,MESSAGES.WALLET.FETCHED,HttpStatus.OK)
    })

    getPlatformWallet = asyncHandler(async(req:Request,res:Response)=>{

        const page = Number(req.query.page) || undefined 
        const limit = Number( req.query.limit) || undefined 

        const data = await this._walletService.getPlatformWallet(page,limit) 
        sendSuccess(res,data,MESSAGES.WALLET.FETCHED,HttpStatus.OK)
    })
}
