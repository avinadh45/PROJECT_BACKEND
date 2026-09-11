import Concern from "../../model/concernModel";
import { IConcern } from "../../interface/concern/IConcern";
import { IConcernReadRepository,IConcernWriteRepository } from "../../interface/concern/IConcernRepository";


export class ConcernRepository implements IConcernReadRepository,IConcernWriteRepository{

    async findById(concernId: string): Promise<IConcern | null> {
        return Concern.findById(concernId)
    }

    async findActiveByBooking(bookingId: string): Promise<IConcern | null> {
        
        return Concern.findOne({
            bookingId,status:{ $in:["pending", "approved", "scheduled"]}
        })
    }

    async create(data: Partial<IConcern>): Promise<IConcern> {
        return Concern.create(data)
    }
}