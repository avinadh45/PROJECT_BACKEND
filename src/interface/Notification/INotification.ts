export type NotificationType = "booking_status" | "concern_status" | "reschedule" | "cancellation" | "refund" | "review"; 
export type RecipientRole = "user" | "serviceCenter" | "mechanic"; 
export type ReferenceType = "booking" | "concern" 


export interface INotification {

    _id?: string;
    recipientId: string;
    recipientRole:RecipientRole; 
    type: NotificationType;
    title: string;
    message:string;
    referenceId: string;
    referenceType:ReferenceType;
    isRead:boolean;
    createdAt?:Date
} 


export interface NotifyParams {
  recipientId: string;
  recipientRole: RecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  referenceId: string;
  referenceType: ReferenceType;
}