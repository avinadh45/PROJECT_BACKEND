import { Response,Request } from "express";
import { INotificationService } from "../../interface/Notification/INotificationService";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";

export class NotificationController{

    constructor( private notificationService: INotificationService ){}

    getNotification = asyncHandler(async(req:Request, res:Response)=>{

        const recipientId   = (req as any).user.id;
        const page = Number(req.query.page) || 1 
        const limit = Number(req.query.limit) || 10 
        const result = await this.notificationService.getForRecipient(recipientId,page,limit) 
        sendSuccess(res,result,MESSAGES.NOTIFICATION.NOTIFICATION_FETCHED,HttpStatus.OK)
    })

    getUnreaderCount = asyncHandler(async(req:Request,res:Response)=>{

        const recipientId   = (req as any).user.id;
        const count = await this.notificationService.getUnreadCount(recipientId) 
        sendSuccess(res,count,MESSAGES.NOTIFICATION.UNREAD_FETCH,HttpStatus.OK)
    })

    markAsRead = asyncHandler(async(req:Request,res:Response)=>{

        const recipientId   = (req as any).user.id; 
        const { id } = req.params 
        const update = await this.notificationService.markAsRead(id as string,recipientId) 
        sendSuccess(res,update,MESSAGES.NOTIFICATION.NOTIFICATION_FETCHED,HttpStatus.OK)
    })

    markAllRead = asyncHandler(async(req:Request,res:Response)=>{

    const recipientId   = (req as any).user.id; 
    const result = await this.notificationService.markAllAsRead(recipientId)
    sendSuccess(res,result,MESSAGES.NOTIFICATION.ALL_NOTIFICATION_MARKED,HttpStatus.OK)        
    })
}
