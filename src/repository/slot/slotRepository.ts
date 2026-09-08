import { BaseRepository } from "../base/BaseRepository";
import Slot from "../../model/slotModel";
import { ISlot } from "../../interface/slot/ISlot";
import { ISlotWriteRepository } from "../../interface/slot/ISlotRepository";
import { ISlotReadRepository } from "../../interface/slot/ISlotRepository";
import { AnyBulkWriteOperation, Types } from "mongoose";

export class SlotRepository
  extends BaseRepository<ISlot>
  implements ISlotWriteRepository, ISlotReadRepository
{
  constructor() {
    super(Slot);
  }
  async findByServiceCenterAndData(
    serviceCenterId: string,
    date: string,
  ): Promise<ISlot[]> {
    return await this.model.find({ serviceCenterId, date }).sort({ time: 1 });
  }

  async generateSlotsForDate(serviceCenterId: string,date: string,times: string[],maxBookings: number): Promise<void> {
    const scId = new Types.ObjectId(serviceCenterId); 

    const ops: AnyBulkWriteOperation<ISlot>[] = times.map((time) => ({
        updateOne: {
            filter: { serviceCenterId: scId, date, time },
            update: {
                $setOnInsert: {
                    serviceCenterId: scId,
                    date,
                    time,
                    MaxBooking: maxBookings,
                    bookedCount: 0,
                    status: "available" as const,
                },
            },
            upsert: true,
        },
    }));

    await this.model.bulkWrite(ops);
}
async blockSlot(serviceCenterId: string, date: string, time: string): Promise<void> {
    await this.model.updateOne({serviceCenterId,date,time},{status:"blocked"})
}

async clearRegeneratetableSlots(serviceCenterId: string): Promise<void> {
  await this.model.deleteMany({serviceCenterId,bookedCount:0,status:{$ne:"blocked"}})
}
async unblockSlot(serviceCenterId: string, date: string, time: string): Promise<void> {
  await this.model.updateOne({serviceCenterId,date,time},{status:"available"})
}
async blockFullDay(serviceCenterId: string, date: string): Promise<void> {
  
 await this.model.updateMany({serviceCenterId,date},{status:"blocked"})
  
}

async unblockFullDay(serviceCenterId: string, date: string): Promise<void> {
  
  await this.model.updateMany({serviceCenterId,date},{status:"available"})
}

 async incrementBookedCount(serviceCenterId: string, date: string, time: string): Promise<void> {
  
  await this.model.updateOne({serviceCenterId,date,time},{$inc:{bookedCount:1}})
}

async decrementBookedCount(serviceCenterId: string, date: string, time: string): Promise<void> {
  
  await this.model.updateOne({serviceCenterId,date,time,bookedCount:{$gt:0}},{$inc:{bookedCount:-1}})
}
}
