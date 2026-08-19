import { ISubscription } from "../../interface/subscription/subscriptionInterface";
import { ISubscriptionCreateRepository } from "../../interface/subscription/ISubscriptionRepository";
import { ISubscriptionReadRepos } from "../../interface/subscription/ISubscriptionReadRepository";
import { AppError } from "../../utils/AppError";
import { ISubscriptionService } from "../../interface/subscription/ISubscriptionService";
import { SubscriptionCreateDTO } from "../../dto/subscription/subscriptionCreateDTO";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { SubscriptionMapper } from "../../mapper/subscription/subscriptionMapper";
import { SubscriptionResponseDTO } from "../../dto/subscription/subscriptionResponceDTO";
import { PaginatedResponse } from "../../interface/common/pagination";
import { SubscriptionUpdateDTO } from "../../dto/subscription/updateDTO";
import { ISubscriptionDeleteRepository } from "../../interface/subscription/ISubscriptionDeleteRepo";
import { IServiceCenterRepository } from "../../interface/ServiceCenter/IServiceCenterRepository";
import { ServiceCenterSubscriptionStatusDTO } from "../../interface/subscription/IServiceCenterSubscriptionStatus";
import { ServiceCenterMapper } from "../../mapper/ServiceCenter/ServiceCenterMapper";
import { SubscribeToPlaneDTO } from "../../dto/subscription/SubscribeToPlanDTO";
import { getRazorpayInstance } from "../../utils/razorpay";
import { VerifyPaymentDTO } from "../../dto/subscription/VerifyPaymentDTO";
import crypto from "crypto"

export class SubscriptionService implements ISubscriptionService {
  constructor(
    private _createRepo: ISubscriptionCreateRepository,
    private _readRepo: ISubscriptionReadRepos,
    private _deleteRepo: ISubscriptionDeleteRepository,
    private _serviceCenterRepo:IServiceCenterRepository
  ) {}

  async createSubscription(dto: SubscriptionCreateDTO): Promise<ISubscription> {
    const existing = await this._readRepo.findOne({ name: dto.name });
    if (existing) {
      throw new AppError(
        MESSAGES.SUBSCRIPTION.ALREADY_EXIST,
        HttpStatus.CONFLICT,
      );
    }
    const created = await this._createRepo.create(dto);
    return SubscriptionMapper.toResponseDTO(created);
  }

  async listSubscription(
    page: number,
    limit: number,
    search: string,
  ): Promise<PaginatedResponse<SubscriptionResponseDTO>> {
    const result = await this._readRepo.listSubscription(page, limit, search);

    return {
      data: result.data.map(SubscriptionMapper.toResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
  async updateSubscription(id: string, data: SubscriptionUpdateDTO): Promise<SubscriptionResponseDTO> {

    const existing = await this._readRepo.findById(id) 
    if(!existing){
      throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    if(data.name && data.name !== existing.name){

      const clash = await this._readRepo.findOne({name:data.name})
      if(clash){
        throw new AppError(MESSAGES.SUBSCRIPTION.ALREADY_EXIST,HttpStatus.CONFLICT)
      }
    }
    const domainData = SubscriptionMapper.toUpdateDomain(data)
    const update = await this._createRepo.updateById(id,domainData)
    return SubscriptionMapper.toResponseDTO(update)
  }

  async deleteSubscription(id: string): Promise<void> {
    
    const subscription = await this._readRepo.findById(id)
    if(!subscription){
        throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    const deleted = await this._deleteRepo.delete(id)
    if(!deleted){
      throw new AppError(MESSAGES.SUBSCRIPTION.DELET_FAILED,HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getSubscription(serviceCenterId: string): Promise<ServiceCenterSubscriptionStatusDTO> {
    const serviceCenter = await this._serviceCenterRepo.findById(serviceCenterId)
    if(!serviceCenter){
      throw new AppError(MESSAGES.SERVICE_CENTER.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
   return ServiceCenterMapper.toStatusDTO(serviceCenter,this._readRepo)

  }

 async createPaymentOrder(dto: SubscribeToPlaneDTO): Promise<{ orderId: string; amount: number; currency: string; }> { 
  const plane = await this._readRepo.findById(dto.subscriptionId)
    if(!plane){
      throw new AppError(MESSAGES.SUBSCRIPTION.INVALID_SUBSCRIPTION,HttpStatus.NOT_FOUND)
    }
    const tier = plane.pricing.find((t)=> t.durationMonths === dto.durationMonths); 
    if(!tier){
      throw new AppError(MESSAGES.SUBSCRIPTION.INVALID_TIER,HttpStatus.BAD_REQUEST)
    }
    const amountInPaisa = tier.price * 100 
    const order = await getRazorpayInstance().orders.create({
      amount: amountInPaisa,
      currency: "INR",
      receipt: `motocline_sub_${Date.now()}`
    })
    return {orderId:order.id,amount:amountInPaisa,currency:"INR"}
 }
  
  async subscribeToPlane(serviceCenterId: string, dto: SubscribeToPlaneDTO): Promise<ServiceCenterSubscriptionStatusDTO> {
    const plan = await this._readRepo.findById(dto.subscriptionId) 
    if(!plan){
      throw new AppError(MESSAGES.SUBSCRIPTION.INVALID_SUBSCRIPTION,HttpStatus.NOT_FOUND)
    }
    const tier = plan.pricing.find((t) => t.durationMonths === dto.durationMonths)
    if(!tier){
      throw new AppError(MESSAGES.SUBSCRIPTION.INVALID_TIER,HttpStatus.BAD_REQUEST)
    }
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + dto.durationMonths)

    const updateServiceCenter = await this._serviceCenterRepo.updateServiceCenter(serviceCenterId,
      {subscription:{planId:dto.subscriptionId,startDate,endDate,status:"active"}})

      if(!updateServiceCenter){
        throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
      }
      return ServiceCenterMapper.toStatusDTO(updateServiceCenter,this._readRepo)
  }

  async verifyPaymentAndSubscription(serviceCenterId: string, dto: VerifyPaymentDTO): Promise<ServiceCenterSubscriptionStatusDTO> {
    
    const { razorpay_order_id,razorpay_payment_id,razorpay_signature,subscriptionId,durationMonths} = dto 
    const generatedSignature = crypto 
    .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

    if(generatedSignature !== razorpay_signature){
      throw new AppError(MESSAGES.COMMON.PAYMENT_FAILED,HttpStatus.BAD_REQUEST)
    }
    return this.subscribeToPlane(serviceCenterId,{subscriptionId,durationMonths})
  }
}

