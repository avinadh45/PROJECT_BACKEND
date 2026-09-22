import Concern from "../../model/concernModel";
import { IConcern } from "../../interface/concern/IConcern";
import { IConcernReadRepository,IConcernWriteRepository } from "../../interface/concern/IConcernRepository";
import { PaginatedResponse } from "../../interface/common/pagination";
import { Types,PipelineStage  } from "mongoose";


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
    async findByServiceCenter(serviceCenterId: string, page: number, limit: number, status?: string): Promise<PaginatedResponse<any>> {
        const skip = ( page-1 )*limit 
        const matchStage: Record<string,any> = { serviceCenterId: new Types.ObjectId(serviceCenterId)}
        if(status) matchStage.status = status 
        const pipeline : PipelineStage[]= [
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "customer" } },
    { $unwind: "$customer" },
    { $lookup: { from: "bookings", localField: "bookingId", foreignField: "_id", as: "booking" } },
    { $unwind: "$booking" },
    { $lookup: { from: "vehicles", localField: "booking.vehicleId", foreignField: "_id", as: "vehicle" } },
    { $unwind: "$vehicle" },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              issueTitle: 1,
              status: 1,
              createdAt: 1,
              customerName: "$customer.name",
              vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
            },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];
        const result = await Concern.aggregate(pipeline)
        const data = result[0]?.data ??[]
        const total = result[0]?.totalCount?.[0]?.count??0 
        return { data,total,page,limit,totalPages:Math.max(1,Math.ceil(total/limit))}
    }
   async findConcernDetail(concernId: string, serviceCenterId: string): Promise<any | null> {
  const result = await Concern.aggregate([
    { $match: { _id: new Types.ObjectId(concernId), serviceCenterId: new Types.ObjectId(serviceCenterId) } },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "customer" } },
    { $unwind: "$customer" },
    { $lookup: { from: "bookings", localField: "bookingId", foreignField: "_id", as: "booking" } },
    { $unwind: "$booking" },
    { $lookup: { from: "vehicles", localField: "booking.vehicleId", foreignField: "_id", as: "vehicle" } },
    { $unwind: "$vehicle" },
    { $lookup: { from: "categories", localField: "booking.categoryId", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    {
      $project: {
        issueTitle: 1,
        description: 1,
        proof: 1,
        status: 1,
        providerResponse: 1,
        timeline: 1,
        createdAt: 1,
        bookingId: 1,
        customerName: "$customer.name",
        customerPhone: "$customer.phoneNumber",
        vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
        categoryName: "$category.name",
        originalServiceDate: "$booking.schedule.date",
      },
    },
  ]);
  return result[0] ?? null;
}

async respond(concernId: string, serviceCenterId: string, rejected: boolean, rejectReason?: string): Promise<IConcern | null> {
    return await Concern.findOneAndUpdate({_id:concernId,serviceCenterId:new Types.ObjectId(serviceCenterId),status:"pending"},
    {$set:{status: rejected ? "rejected" : "approved",
        providerResponse: {rejected, rejectReason, respondedAt: new Date()}
    },
    $push:{ timeline: { status: rejected ? "rejected" : "approved", updatedBy: serviceCenterId, at: new Date() },}
},
{new:true})
}
async findConcernDetails(concernId: string, serviceCenterId: string): Promise<any | null> {
    
    const result = await Concern.aggregate([{$match:{_id:new Types.ObjectId(concernId),serviceCenterId: new Types.ObjectId(serviceCenterId)}},
        {$lookup:{from:"users",localField:"userId",foreignField:"_id",as:"customer"}},
        {$unwind:"$customer"},
        {$lookup:{from:"bookings",localField:"bookingId",foreignField:"_id",as:"booking"}},
        {$unwind:"$booking"},
        {$lookup:{from:"vehicles",localField:"booking.vehicleId",foreignField:"_id",as:"vehicle"}},
        {$unwind:"$vehicle"},
        {$lookup:{from:"categories",localField:"booking.categoryId",foreignField:"_id",as:"category"}},
        {$unwind:"$category"},
        {
            $project:{
        issueTitle: 1,
        description: 1,
        proof: 1,
        status: 1,
        providerResponse: 1,
        timeline: 1,
        createdAt: 1,
        bookingId: 1,
        customerName: "$customer.name",
        customerPhone: "$customer.phoneNumber",
        vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
        categoryName: "$category.name",
        originalServiceDate: "$booking.schedule.date",
            }
        }
    ])
    return result[0] ?? null
}
async markSchedule(concernId: string, resolutionBookingId: string, updatedBy: string): Promise<IConcern | null> {
  
  return Concern.findOneAndUpdate({id:concernId},{
    $set:{status:"scheduled",resolutionBookingId:new Types.ObjectId(resolutionBookingId)},
    $push:{timeline:{status:"schedule",updatedBy,at:new Date()}}
  },{new:true})
}

async findUserConcernDetail(concenId: string, userId: string): Promise<any | null> {
  
  const result = await Concern.aggregate([{
  $match:{_id:new Types.ObjectId(concenId),userId: new Types.ObjectId(userId)}},
  {$lookup:{from:"bookings",localField:"bookingId",foreignField:"_id", as:"booking"}},
  {$unwind:"$booking"},
  {$lookup:{from:"vehicles",localField:"booking.vehicleId",foreignField:"_id",as:"vehicle"}},
  {$unwind:"$vehicle"},
  {$lookup:{from:"categories",localField:"booking.categoryId",foreignField:"_id",as:"category"}},
  {$unwind:"$category"},
  {$lookup:{from:"servicecenters",localField:"serviceCenterId",foreignField:"_id",as:"serviceCenter" }},
  {$unwind:"$serviceCenter"},
  {
    $project:{
      issueTitle: 1,
        description: 1,
        proof: 1,
        status: 1,
        providerResponse: 1,
        timeline: 1,
        createdAt: 1,
        bookingId: 1,
        serviceCenterId: 1,
        resolutionBookingId: 1,
        vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
        vehicleBrand: "$vehicle.brand",
        vehicleModel: "$vehicle.model",
        vehiclePhotoUrl: "$vehicle.documents.vehicleImage",
        categoryName: "$category.name",
        garageName: "$serviceCenter.providerProfile.garageName",
        originalServiceDate: "$booking.schedule.date",
    }
  }
])
return result[0] ?? null
}
async findActiveConcernByBookingIds(bookingIds: string[]): Promise<{ bookingId: string; concernId: string; }[]> {
  
  const concerns = await Concern.find({
    bookingId:{$in:bookingIds.map((id)=> new Types.ObjectId(id))},
    status:{$in:["pending", "approved", "scheduled"]}},
    {bookingId:1})
    return concerns.map((c)=> ({bookingId:c.bookingId.toString(),concernId:c._id.toString()}))
}
}