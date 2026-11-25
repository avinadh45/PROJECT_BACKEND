
export interface NotificationResponseDTO{

    id:string;
    type:string;
    title:string;
    message:string
    referenceId: string;
    referenceType: string;
    isRead:boolean;
    createdAt:Date
}
