import { IConcern } from "./IConcern";

export interface IConcernReadRepository {

    findById(concernId:string):Promise<IConcern | null>
    findActiveByBooking(bookingId:string):Promise<IConcern | null>
}
export interface IConcernWriteRepository{

    create(data:Partial<IConcern>):Promise<IConcern>
}