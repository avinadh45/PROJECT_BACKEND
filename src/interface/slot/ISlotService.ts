import { SlotResponseDTO } from "../../dto/slot/slotResponseDTO";

export interface ISlotService{
    getAvailableSlots(serviceCenterId:string,date:string):Promise<SlotResponseDTO[]>
    blockSlot(serviceCenterId:string,date:string,time:string):Promise<void>
    unblockSlot(servicCenterId:string,date:string,time:string):Promise<void>
    blockFullDay(servicCenterId:string,date:string):Promise<void>
    unBlockFullDay(servicCenterId:string,date:string):Promise<void>
}