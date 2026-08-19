import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IMailService } from "../mail/IMailService";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../enums/httpstatus";
import { PaginatedResponse } from "../../interface/common/pagination";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { IServiceCenterService } from "../../interface/ServiceCenter/IServiceCenterService";
import { ServiceCenterRegisterDTO } from "../../dto/serviceCenter/RegisterDTO";
import { ServiceCenterMapper } from "../../mapper/ServiceCenter/ServiceCenterMapper";
import { ServiceCenterLogin } from "../../dto/serviceCenter/LoginDTO";
import { IServiceCenterRepository } from "../../interface/ServiceCenter/IServiceCenterRepository";
import type { servicecenterDTO } from "../../dto/admin/ServiceCenterListDTO";
import { serviceCenterDetailsDTO } from "../../dto/admin/serviceCenterDetails";
import { ForgotPasswordDTO } from "../../dto/serviceCenter/forgotDTO";
import { ResetPasswordDTO } from "../../dto/serviceCenter/resetPassword";
import { VerificationDetailsDTO } from "../../dto/admin/verificationDTO";
import { IServiceCenter } from "../../interface/ServiceCenter/IServiceCenter";
import { MESSAGES } from "../../constants/message";
import { logger } from "../../config/logger";
import { VerificationStatusDTO } from "../../dto/serviceCenter/verifistatus";
import { ServiceCenterEditDTO } from "../../dto/serviceCenter/serviceCenterEditDTO";
import { Types } from "mongoose";
import { ICategoryReadRepository } from "../../interface/category/ICategoryRepository";
import { UpdateServiceFeeDTO } from "../../dto/serviceCenter/udateAdvanceFee";
import { AddServiceDTO } from "../../dto/serviceCenter/addServiceDTO";
import { ICategory } from "../../interface/category/categoryinterface";
import { AvailabilityResponseDTO } from "../../dto/serviceCenter/AvailabilityResponseDTO";
import { UpdateAvailabilityDTO } from "../../dto/slot/UpdateAvilability";
import { ISlotWriteRepository } from "../../interface/slot/ISlotRepository";


export class ServiceCenterService implements IServiceCenterService {
  constructor(
    private _repository: IServiceCenterRepository,
    private _mailService: IMailService,
    private _categoryRepository: ICategoryReadRepository,
    private _slotWriteRepo:ISlotWriteRepository

  ) {}

  async register(dto: ServiceCenterRegisterDTO) {
    logger.info("Service center registration request received", {
      email: dto.email,
    });
    const existing = await this._repository.findByEmail(dto.email);

    if (existing) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    if(dto.servicesOffered && dto.servicesOffered.length > 0){
      dto.servicesOffered = await Promise.all(dto.servicesOffered.map(async(service)=>{
        const categorys = await this._categoryRepository.findbyId(service.serviceId)
        return { ...service,advanceFee : null}
      }))
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    dto.password = hashedPassword;

    const data = ServiceCenterMapper.toEntity({
      ...dto,
    });

    const saved = await this._repository.createServiceCenter(data);

    const accessToken = generateAccessToken({
      id: saved._id.toString(),
      role: "serviceCenter",
    });

    const refreshToken = generateRefreshToken({
      id: saved._id.toString(),
      role: "serviceCenter",
    });

    return ServiceCenterMapper.authResponse(saved, accessToken, refreshToken);
  }

  async login(dto: ServiceCenterLogin) {
    const serviceCenter = await this._repository.findByEmail(dto.email);

    if (!serviceCenter) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (serviceCenter.isBlocked === true) {
      throw new AppError(MESSAGES.SERVICE_CENTER.BLOCK, HttpStatus.FORBIDDEN);
    }
    const isMatch = await bcrypt.compare(dto.password, serviceCenter.password);

    if (!isMatch) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.INVALID,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = generateAccessToken({
      id: serviceCenter._id.toString(),
      role: "serviceCenter",
    });

    const refreshToken = generateRefreshToken({
      id: serviceCenter._id.toString(),
      role: "serviceCenter",
    });

    return ServiceCenterMapper.authResponse(
      serviceCenter,
      accessToken,
      refreshToken,
    );
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    );
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });
    return { accessToken: newAccessToken };
  }

  async forgotpassword(dto: ForgotPasswordDTO) {
    const serviceCenter = await this._repository.findByEmail(dto.email);
    if (!serviceCenter) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const token = crypto.randomBytes(30).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 10);
    await this._repository.updateServiceCenter(serviceCenter._id.toString(), {
      resetToken: token,
      resetTokenExpiry: expiry,
    });
    const resetLink = `http://localhost:5173/service-center/reset-password?token=${token}`;
    await this._mailService.sendResetPasseord(dto.email, resetLink);
  }

  async resetPassword(dto: ResetPasswordDTO): Promise<void> {
    const serviceCenter = await this._repository.findServiceCenterByToken(
      dto.token,
    );
    if (!serviceCenter) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.INVALID,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      !serviceCenter.resetTokenExpiry ||
      serviceCenter.resetTokenExpiry < new Date()
    ) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.EXPIRED,
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    logger.info("Password reset hash generated");
    await this._repository.updateServiceCenter(serviceCenter._id.toString(), {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });
    const updated = await this._repository.findByEmail(serviceCenter.email);
    console.log("DB PASSWORD:", updated?.password);
  }

  async serviceCenterList(
    page: number,
    limit: number,
    search: string = "",
  ): Promise<PaginatedResponse<servicecenterDTO>> {
    const result = await this._repository.findAll(page, limit, search);
    return { ...result, data: result.data.map(ServiceCenterMapper.toListDTO) };
  }

  async getServiceCenter(id: string): Promise<serviceCenterDetailsDTO> {
    const serviceCenter = await this._repository.findById(id);
    if (!serviceCenter) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return ServiceCenterMapper.toDetailsDTO(serviceCenter);
  }

  async block(id: string): Promise<serviceCenterDetailsDTO> {
    const data = await this._repository.findById(id);
    if (!data) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const serviceCenter = await this._repository.updateServiceCenter(id, {
      isBlocked: !data.isBlocked,
    });
    if (!serviceCenter) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return ServiceCenterMapper.toDetailsDTO(serviceCenter);
  }

  async getPendingServiceCenter(): Promise<servicecenterDTO[]> {
    const serviceCenters = await this._repository.findPendingServiceCenter();
    return serviceCenters.map((item) => ServiceCenterMapper.toListDTO(item));
  }

  async getVerification(id: string): Promise<VerificationDetailsDTO> {
    const serviceCenter = await this._repository.findById(id);
    if (!serviceCenter) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return ServiceCenterMapper.toVerificationDetailsDTO(serviceCenter);
  }
  async acceptVerification(id: string): Promise<IServiceCenter> {
    const serviceCenter = await this._repository.updateServiceCenter(id, {
      verificationStatus: "approved",
      isverified: true,
    });
    if (!serviceCenter) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return serviceCenter;
  }
  async rejectVerification(
    id: string,
    rejectionReason: string,
  ): Promise<IServiceCenter> {
    const serviceCenter = await this._repository.updateServiceCenter(id, {
      verificationStatus: "rejected",
      isverified: false,
      rejectionReason,
      rejectedAt: new Date(),
      reviewedAt: new Date(),
    });
    if (!serviceCenter) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return serviceCenter;
  }

  async getVerifiStatus(id: string): Promise<VerificationStatusDTO> {
    const serviceCenter = await this._repository.findById(id);

    if (!serviceCenter) {
      throw new AppError(MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return ServiceCenterMapper.toVerificationStatusDTO(serviceCenter);
  }
  async editVerification(id: string): Promise<ServiceCenterEditDTO> {
    const serviceCenter = await this._repository.findById(id);

    if (!serviceCenter) {
      throw new AppError(MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return ServiceCenterMapper.toEditDTO(serviceCenter);
  }

  async updateVerification(
    id: string,
    dto: ServiceCenterEditDTO,
    garageLicense?: Express.Multer.File,
    ownerIdProof?: Express.Multer.File,
  ): Promise<IServiceCenter> {
    const serviceCenter = await this._repository.findById(id);

    if (!serviceCenter) {
      throw new AppError(MESSAGES.USER.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updateData: Partial<IServiceCenter> = {
      providerProfile: {
        ...serviceCenter.providerProfile,

        ownerName: dto.ownerName,

        garageName: dto.garageName,

        phone: dto.phone,

        location: dto.location,
      },

      availability: dto.availability,

      servicesOffered: dto.servicesOffered.map((service) => ({
        serviceId: new Types.ObjectId(service.serviceId),
        advanceFee: service.advanceFee,
        status: service.status,
        vehicleTypes: service.vehicleTypes,
        serviceModes: service.serviceModes,
      })),

      verificationStatus: "pending",

      rejectionReason: "",

      isverified: false,
    };

    if (garageLicense) {
      updateData.providerProfile!.documents = {
        ...serviceCenter.providerProfile.documents,

        garageLicense: {
          url: garageLicense.path,
          public_id: garageLicense.filename,
        },
      };
    }

    if (ownerIdProof) {
      updateData.providerProfile!.documents = {
        ...updateData.providerProfile!.documents,

        ownerIdProof: {
          url: ownerIdProof.path,
          public_id: ownerIdProof.filename,
        },
      };
    }

    const update = await this._repository.updateServiceCenter(id, updateData);

    if (!update) {
      throw new AppError(
        MESSAGES.SERVICE_CENTER.UPDATION_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }

    return update;
  }

 async getServiceCenterServices(id: string, page: number, limit: number, search: string): Promise<PaginatedResponse<any>> {
  
  return await this._repository.findWithService(id,page,limit,search)
}

  async updateServiceFee(serviceCenterId: string, dto: UpdateServiceFeeDTO): Promise<IServiceCenter> {
    if(dto.advanceFee !== null && dto.advanceFee <0){
      throw new AppError(MESSAGES.SERVICE_CENTER.INVALID_FEE,HttpStatus.BAD_REQUEST)
    }
    const update = await this._repository.updateServiceFee(serviceCenterId,dto.serviceId,dto.advanceFee)
    if(!update){
      throw new AppError(MESSAGES.SERVICE_CENTER.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    return update
  }
  
  async addService(serviceCenterId: string, dto: AddServiceDTO): Promise<IServiceCenter> {
    
    const alreadyExisting = await this._repository.checkExistingService(serviceCenterId,dto.serviceId) 
    if(alreadyExisting){
      throw new AppError(MESSAGES.SERVICE_CENTER.SERVICE_EXIST,HttpStatus.CONFLICT)
    }
    if(!dto.vehicleTypes.length || !dto.serviceModes.length){
      throw new AppError(MESSAGES.SERVICE_CENTER.MISSING_VEHICLE_OR_MODE,HttpStatus.BAD_REQUEST)
    }
    const category = await this._categoryRepository.findbyId(dto.serviceId) 
    if(!category){
      throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    const service = ServiceCenterMapper.toServiceOffered(dto) 
  
    const updated = await this._repository.addService(serviceCenterId,service)
    // if(!!updated){
    //   throw  new AppError(MESSAGES.SERVICE_CENTER.NOT_FOUND,HttpStatus.NOT_FOUND)
    // }
    return updated as IServiceCenter
  }
  async getAvailableCategoryies(): Promise<ICategory[]> {
    
    return await this._categoryRepository.findAllCategories()
  }

  async toggleServiceStatus(serviceCenterId: string, serviceId: string): Promise<IServiceCenter> {
    
    const serviceCenter = await this._repository.findById(serviceCenterId)
    if(!serviceCenter){
      throw new AppError(MESSAGES.SERVICE_CENTER.NOT_FOUND,HttpStatus.NOT_FOUND)
    }

    const service = serviceCenter.servicesOffered?.find(a=> (a.serviceId as any)._id.toString() === serviceId) 
    if(!service){
      throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    const newStatus = service.status === "active" ? "inactive" : "active" 
    const updated = await this._repository.toggleServiceStatus(serviceCenterId,serviceId,newStatus)
    if(!updated){
      throw new AppError(MESSAGES.SERVICE_CENTER.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    return updated
  }
  async getProfile(serviceCenterId: string): Promise<IServiceCenter> {
    
    const serviceCenter = await this._repository.findById(serviceCenterId)
    if(!serviceCenter){
      throw new AppError(MESSAGES.SERVICE_CENTER.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    return serviceCenter
  }
  async updateAvailiability(serviceCenterId: string, dto: UpdateAvailabilityDTO): Promise<AvailabilityResponseDTO> {
    
    if(dto.workingDays.length === 0){
      throw new AppError(MESSAGES.SERVICE_CENTER.NO_WORKING_DAYS,HttpStatus.BAD_REQUEST)
    }
    if(dto.workingHours.start >= dto.workingHours.end){
      throw new AppError(MESSAGES.SERVICE_CENTER.INVALID_WORKING_HOURS,HttpStatus.BAD_REQUEST)
    }
    if(dto.slotDuration <= 0 || dto.maxBookingsPerSlot <=0){
      throw new AppError(MESSAGES.SERVICE_CENTER.INVALID_AVAILABILITY_VALUES,HttpStatus.BAD_REQUEST)
    }
    const updated = await this._repository.updateServiceCenter(serviceCenterId,{
      availability:{
        workingDays:dto.workingDays,
        workingHours:dto.workingHours,
        slotDuration:dto.slotDuration,
        maxBookingsPerSlot:dto.maxBookingsPerSlot
      }
    })
    if(!updated){
      throw new AppError(MESSAGES.SERVICE_CENTER.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    this._slotWriteRepo.clearRegeneratetableSlots(serviceCenterId)
    return ServiceCenterMapper.toResponseDTO(updated)
  }
}
