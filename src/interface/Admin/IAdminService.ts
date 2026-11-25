import { AdminLoginDTO } from "../../dto/admin/adminLogindto";
import { AdminAuthResponseDTO } from "../../dto/admin/adminAuthResponsedto";
import { AdminProfileDTO } from "../../dto/admin/AdminProfileDTO";

export interface IAdminService{
    login(data:AdminLoginDTO):Promise<AdminAuthResponseDTO>
    refreshToken(token:string): Promise<string>
    getProfile(adminId:string): Promise<AdminProfileDTO>
}