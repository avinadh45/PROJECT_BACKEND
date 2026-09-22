import { IMessage } from "./IMessage";

export interface IMessageReadRepository{

    findByConversation(conversationId:string,page:number,limit:number):Promise<any>
    countUnread(conversationId: string, userId:string):Promise<number>
}

export interface IMessageWriteRepository {
    
    create(data:Partial<IMessage>):Promise<IMessage>
    markAsRead(conversationId:string,userId:string):Promise<void>
}