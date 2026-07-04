
export interface   IUserProfile{
    image?: string;
}

export interface IUser {
    _id: string;
    name:string;
    email:string;
    role: "user"  | "admin" | "mechanic";
    phoneNumber: string;
    password:string;
    userProfile?: IUserProfile;
     garageId?: string;
    isVerified?: boolean;
    isBlocked?:boolean;
    resetToken?: string | null;
       googleId?:string | null
    resetTokenExpiry?: Date | null;
    createdAt?:Date;
    updateAt?:Date;
}
