export interface userListDTO{
    id:string;
    email:string;
    name:string;
    role:string;
    phoneNumber:string;
    isBlocked?:boolean;
    createdAt?: Date
}