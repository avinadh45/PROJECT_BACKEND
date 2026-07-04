import { IServiceCenter } from "./IServiceCenter";
import { ServiceCenterRegisterDTO } from "../../dto/serviceCenter/RegisterDTO";
import { ServiceCenterLogin } from "../../dto/serviceCenter/LoginDTO";
import { serviceCenterDetailsDTO } from "../../dto/admin/serviceCenterDetails";
import { ServiceCenterResponseDTO } from "../../dto/serviceCenter/ServiceCenterResponseDTO.";
import { servicecenterDTO } from "../../dto/admin/ServiceCenterListDTO";
import { ForgotPasswordDTO } from "../../dto/serviceCenter/forgotDTO";
import { ResetPasswordDTO } from "../../dto/serviceCenter/resetPassword";
import { PaginatedResponse } from "../common/pagination";
import { VerificationDetailsDTO } from "../../dto/admin/verificationDTO";
import { VerificationStatusDTO } from "../../dto/serviceCenter/verifistatus";
import { ServiceCenterEditDTO } from "../../dto/serviceCenter/serviceCenterEditDTO";
export interface IServiceCenterService{
    register(dto:ServiceCenterRegisterDTO):Promise< ServiceCenterResponseDTO>
    login(dto:ServiceCenterLogin):Promise<any>
    refreshToken(token:string):Promise<{accessToken :string}>
    serviceCenterList(page:number,limit:number,search:string):Promise<PaginatedResponse<servicecenterDTO>>
    getServiceCenter(id:string):Promise<serviceCenterDetailsDTO>
    block(id:string):Promise<serviceCenterDetailsDTO>
    forgotpassword(email:ForgotPasswordDTO):Promise<void>
    resetPassword(dto:ResetPasswordDTO):Promise<void>
    getPendingServiceCenter():Promise<servicecenterDTO[]>
    getVerification(id:string):Promise<VerificationDetailsDTO>
    acceptVerification(id:string):Promise<IServiceCenter>
    rejectVerification(id:string,rejectionReason:string):Promise<IServiceCenter>
    getVerifiStatus(id:string):Promise<VerificationStatusDTO>
    editVerification(id:string):Promise<ServiceCenterEditDTO>
    updateVerification(id:string,dto:ServiceCenterEditDTO,garageLicense?:Express.Multer.File,ownerIdProof?:Express.Multer.File):Promise<IServiceCenter>
}
