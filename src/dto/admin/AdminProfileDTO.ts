export interface ServiceCenterProfileDTO{
    id:string;
    email:string;
    garageName:string;
    rating?: number;
    reviewCount?: number;
}

export interface AdminProfileDTO { 

    id:string;
    name:string;
    email:string;
    role:string;
    createdAt:string
}