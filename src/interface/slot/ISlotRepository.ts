import { ISlot } from "./ISlot";

export interface ISlotReadRepository{
    findByServiceCenterAndData(serviceCenterId:string,date:string):Promise<ISlot[]>
}


export interface ISlotWriteRepository{

    generateSlotsForDate(serviceCenterId:string,date:string,times:string[],maxBookings:number):Promise<void>
    blockSlot(serviceCenterId:string,date:string,time:string):Promise<void>
    clearRegeneratetableSlots(serviceCenterId:string):Promise<void>
    unblockSlot(serviceCenterId:string,date:string,time:string):Promise<void> 
    blockFullDay(servicCenterId:string,date:string):Promise<void>
    unblockFullDay(serviceCenterId:string,date:string):Promise<void>
}
