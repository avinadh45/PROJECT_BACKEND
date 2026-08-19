import { ISlotService } from "../../interface/slot/ISlotService";
import { ISlot } from "../../interface/slot/ISlot";
import { ISlotReadRepository } from "../../interface/slot/ISlotRepository";
import { ISlotWriteRepository } from "../../interface/slot/ISlotRepository";
import { SlotResponseDTO } from "../../dto/slot/slotResponseDTO";
import { IServiceCenterRepository } from "../../interface/ServiceCenter/IServiceCenterRepository";
import { SlotMapper } from "../../mapper/slot/slotMapper";
import { AppError } from "../../utils/AppError";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { generateTimeSlots } from "../../utils/timeUtilit";

export class SlotService implements ISlotService {
  constructor(private  _slotread : ISlotReadRepository,
              private  _slotwrite:ISlotWriteRepository, private _serviceCenterRepo:IServiceCenterRepository) {}

  async getAvailableSlots(serviceCenterId: string,date: string, ): Promise<SlotResponseDTO[]> {

    const existing = await this._slotread.findByServiceCenterAndData(serviceCenterId,date)
    
    if(existing.length > 0){
      return existing.map(SlotMapper.toResponseDTO)
    }
    const serviceCenter  =  await this._serviceCenterRepo.findById(serviceCenterId)
    
    if(!serviceCenter){
      throw new AppError(MESSAGES.SERVICE_CENTER.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    console.log("availability:", serviceCenter.availability);
    if(!serviceCenter.availability){
      throw new AppError(MESSAGES.SLOT.NO_AVAILABILITY_CONFIGURED,HttpStatus.BAD_REQUEST)
    }
    
   const { workingDays,workingHours,slotDuration,maxBookingsPerSlot} = serviceCenter.availability 

   if (!workingHours?.start || !workingHours?.end || !slotDuration || !maxBookingsPerSlot) {
  throw new AppError(MESSAGES.SLOT.INCOMPLETE_AVAILABILITY, HttpStatus.BAD_REQUEST);
}
   const days = new Date(date).toLocaleDateString("en-US",{weekday:"short"})

   if(!workingDays.includes(days)){
    return []
   }

   const times = generateTimeSlots(workingHours.start, workingHours.end,slotDuration)
    await this._slotwrite.generateSlotsForDate(serviceCenterId,date,times,maxBookingsPerSlot)

    const generated = await this._slotread.findByServiceCenterAndData(serviceCenterId,date)
    return generated.map(SlotMapper.toResponseDTO)
  }
  
   async blockSlot(serviceCenterId: string, date: string, time: string): Promise<void> {
     
    await this._slotwrite.blockSlot(serviceCenterId,date,time)
   }

   async unblockSlot(servicCenterId: string, date: string, time: string): Promise<void> {
     
    await this._slotwrite.unblockSlot(servicCenterId,date,time)
   }

   async blockFullDay(servicCenterId: string, date: string): Promise<void> {
     
    await this._slotwrite.blockFullDay(servicCenterId,date)
   }
   async unBlockFullDay(servicCenterId: string, date: string): Promise<void> {
     
    await this._slotwrite.blockFullDay(servicCenterId,date)
   }
}
