export interface userResponseDTO{
    user:{
        id:string;
        email:string;
        name:string;
        role:string;
    };
    accessToken:string;
    refreshToken:string;
}