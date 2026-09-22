import { Request, Response  } from "express";
import { IChatService } from "../../interface/Chat/IChatService";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
 
    import { extractRequester } from "../../middleware/verifyAnyRole";

export class ChatController{

    constructor(private _chatService:IChatService){}

    getMessage = asyncHandler(async(req:Request,res:Response)=>{

        const userId = (req as any).user?.id ?? (req as any).mechanic?.id ?? (req as any).serviceCenter?.id;
        const { conversationId } = req.params; 
        const page = Number(req.query.page) || 1 
        const limit = Number(req.query.limit) || 50
        const result = await this._chatService.getMessage(conversationId as string,userId,page,limit)
        sendSuccess(res,result,MESSAGES.CHAT.CHAT_FETCHED,HttpStatus.OK)
    })
   getOrCreateBookingConversation = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { id: requesterId, role: requesterRole } = extractRequester(req);

  const conversationId = await this._chatService.getOrCreateBookingConversation(bookingId as string, requesterId, requesterRole);
  sendSuccess(res, { conversationId }, MESSAGES.CHAT.CONVERSATION_READY, HttpStatus.OK);
});

getOrCreateConcernConversation = asyncHandler(async (req: Request, res: Response) => {
  const { concernId } = req.params;
  const { id: requesterId, role: requesterRole } = extractRequester(req);

  const conversationId = await this._chatService.getOrCreateConcernConversation(concernId as string, requesterId, requesterRole);
  sendSuccess(res, { conversationId }, MESSAGES.CHAT.CONVERSATION_READY, HttpStatus.OK);
});

    markConversation = asyncHandler(async(req:Request,res:Response)=>{ 

        const { conversationId } = req.params; 
        const { id: userId } = extractRequester(req);

       await this._chatService.markConversationRead(conversationId as string, userId);
       sendSuccess(res, null, MESSAGES.CHAT.MARKED_READ, HttpStatus.OK);

    })
}