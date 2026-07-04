import { AdminLoginDTO } from "../../dto/admin/adminLogindto";
import { AdminAuthResponseDTO } from "../../dto/admin/adminAuthResponsedto";

export interface IAdminService{
    login(data:AdminLoginDTO):Promise<AdminAuthResponseDTO>
    refreshToken(token:string): Promise<string>
}