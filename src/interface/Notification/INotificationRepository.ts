import { INotification } from "./INotification";

export interface INotificationReadRepository {

     findByRecipien(recipientId:string,page:number,limit:number):Promise<{ items:INotification[];total:number}>
     countUnread(recipientId:string):Promise<number>
}

export interface INotificationWriteRepository {

    create(date:Partial<INotification>):Promise<INotification>
    markAsRead(id:string,recipientId:string):Promise<INotification | null>
    markAllAsRead(recipientId:string):Promise<void>
}