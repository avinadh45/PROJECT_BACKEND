import { Types } from "mongoose";
import Booking from "../../model/bookingModel";
import { IBooking, IJobDescriptionItem } from "../../interface/Booking/IBookking";
import ServiceCenter from "../../model/ServiceCenterModel";
import {
  IBookingWriteRepository,
  IBookkingReadRepository,
} from "../../interface/Booking/IBookingRepository";
import { PaginatedResponse } from "../../interface/common/pagination";

export class BookingRepository
  implements IBookingWriteRepository, IBookkingReadRepository
{
  async findByRazorpayOrderId(orderId: string) {
    return Booking.findOne({ "advancePayment.razorpayOrderId": orderId });
  }

  async getAdvanceFeeForService(
    serviceCenterId: string,
    categoryId: string,
  ): Promise<number | null> {
    const center = await ServiceCenter.findOne(
      {
        _id: new Types.ObjectId(serviceCenterId),
        servicesOffered: {
          $elemMatch: {
            serviceId: new Types.ObjectId(categoryId),
            status: "active",
          },
        },
      },
      { "servicesOffered.$": 1 },
    );
    const advanceFee = center?.servicesOffered?.[0]?.advanceFee;
    return typeof advanceFee === "number" ? advanceFee :null;

  }
  async create(data: Partial<IBooking>): Promise<IBooking & { save: () => Promise<any>; }> {
      return Booking.create(data)
  }

  async findById(bookingId: string): Promise<IBooking  & { save: () => Promise<any> } | null> {
    
    return await Booking.findById(bookingId)
  }
  async findByServiceCenter(serviceCenterId: string, page: number, limit: number, status?: string, search?: string): Promise<PaginatedResponse<any>> {
    
   // console.log("findByServiceCenter called with:", { serviceCenterId, page, limit, status, search });

    const skip = ( page - 1)*limit 
    const matchStage: Record<string,any>={serviceCenterId: new Types.ObjectId(serviceCenterId)}

    if(status){
      matchStage.status = status
    }

  //  console.log("matchStage:", matchStage);

    const pipeline: any[]=[
      {$match: matchStage},
      {$sort:{createdAt: -1}},
      {
       $lookup:{from:"users",localField:"userId",foreignField:"_id",as:"customer"},},
      {$unwind:"$customer"},
      {$lookup:{from:"vehicles",localField:"vehicleId",foreignField:"_id",as:"vehicle"},},
      {$unwind:"$vehicle"},
      {$lookup:{from:"categories",localField:"categoryId",foreignField: "_id",as:"category"},},
      {$unwind:"$category"},
      {$lookup:{from:"users",localField:"mechanicId",foreignField: "_id",as:"mechanic"},},
      ...(search?[{$match:{$or:[
          {"customer.name":{$regex:search, $options:"i"}},
          { "vehicle.RegistrationNumber":{$regex:search, $options: "i"}},
          { "category.name":{$regex:search, $options: "i"}}
      ]}}]:[]),
      { $facet:{
        data:[
          {$skip:skip},
          {$limit:limit},
          {
            $project:{
              _id:1,
              customerName:"$customer.name",
              vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
              categoryName: "$category.name",
              visitType:1,
              schedule:1,
              mechanicName:{$first:"$mechanic.name"},
              status:1,
              advancePayment:1
            },
          },
        ],
        totalCount: [{$count:"count"}]
      }}
    ];
    const result = await Booking.aggregate(pipeline);
 
    const data = result[0]?.data??[];
    const total = result[0]?.totalCount?.[0]?.count ?? 0;
    return { data,total,page,limit,totalPages:Math.max(1,Math.ceil(total/limit))}
  }
  async findByMechanic(mechanicId: string, page: number, limit: number, status?: string, search?: string): Promise<PaginatedResponse<any>> {
    
    const skip = (page - 1) * limit 
    const matchStage :Record<string,any> = {mechanicId:new Types.ObjectId(mechanicId)}

    if(status){ matchStage.status = status}

    const pipeline:any[]=[{$match:matchStage},{$sort:{createAt:1}},
      { $lookup:{
        from:"users",
        localField:"userId",
        foreignField:"_id",
        as:"customer"
      }},
      {$unwind:"$customer"},
      {
        $lookup:{
          from:"vehicles",
          localField:"vehicleId",
          foreignField:"_id",
          as:"vehicle"
        }
      },
      {$unwind:"$vehicle"},
      {
        $lookup:{
          from:"categories",
          localField:"categoryId",
          foreignField:"_id",
          as:"category"
        }
      },
      {$unwind:"$category"},
      ...(search?[{
        $match:{$or:[{"customer.name":{$regex:search,$options:"i"}},
           {"vehicle.RegistrationNumber":{$regex:search,$options:"i"}},
           {"category.name":{$regex:search,$options:"i"}}
        ]}
      }]:[]),
      {
        $facet:{data:[{$skip:skip},{$limit:limit},{
          $project:{
            _id:1,
            customerName:"$customer.name",
            vehicleRegistrationNumber:"$vehicle.Registraction",
            categoryName:"$category.name",
            visitType: 1,
              schedule: 1,
              status: 1,
              advancePayment: 1,
          }
        }],
        totalCount:[{$count:"count"}]
      }
      }
    ];;
    const result =  await Booking.aggregate(pipeline)
    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount?.[0]?.count ?? 0 
    
    return {
      data,
      total,
      page,
      limit,
      totalPages:Math.max(1,Math.ceil(total/limit))
    }
  }
  async findMechanicBookingDetails(bookingId: string, mechanicId: string): Promise<any | null> {
    
    const result = await Booking.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(bookingId),
        mechanicId: new Types.ObjectId(mechanicId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $lookup: {
        from: "vehicles",
        localField: "vehicleId",
        foreignField: "_id",
        as: "vehicle",
      },
    },
    { $unwind: "$vehicle" },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $project: {
        status: 1,
        visitType: 1,
        schedule: 1,
        additionalInfo: 1,
        job: 1,
        proof:1,
        pickupLocation:1,
        customerName: "$customer.name",
        customerPhone: "$customer.phoneNumber",
        vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
        vehicleType: "$vehicle.vehicleType",
        vehicleBrand: "$vehicle.brand",
        vehicleModel: "$vehicle.model",
        vehiclePhotoUrl: "$vehicle.documents.vehicleImage",
        categoryName: "$category.name",
      },
    },
  ]);
   //console.log("aggregate result:", result)
  return result[0] ?? null;
  }
 async updateJobItems(bookingId: string, mechanicId: string, items: IJobDescriptionItem[]): Promise<IBooking | null> {
    
    const estimateCost = items.reduce((sum,items)=> sum+(items.initalCost || 0),0)

    return Booking.findOneAndUpdate({_id:bookingId,mechanicId:new Types.ObjectId(mechanicId)},
    {$set:{"job.description":items,"job.estimatedCost":estimateCost}},
    {returnDocument:"after"}
  )
  }
 async updateStatus(bookingId: string, mechanicId: string, status: string, updateBy: string): Promise<IBooking | null> {
    return Booking.findOneAndUpdate({_id:bookingId,mechanicId:new Types.ObjectId(mechanicId)},{$set:{status},
      $push:{statusTimeline:{status,updateBy,at: new Date()}}
  },
  {new:true}
)
  }

  async uploadProof(bookingId: string, mechanicId: string, imageUrl: string): Promise<IBooking | null> {
    
    return await Booking.findOneAndUpdate({_id:bookingId,mechanicId: new Types.ObjectId(mechanicId)},
    {$set:{proof:{imageUrl,uploadedBy:mechanicId,uploadedAt: new Date().toISOString()}}},
    {returnDocument:"after"}
  )
  }
  async findServiceCenterBookingDetails(bookingId: string, serviceCenterId: string): Promise<any | null> {
    
    const result = await Booking.aggregate([{$match:{_id: new Types.ObjectId(bookingId),serviceCenterId:new Types.ObjectId(serviceCenterId)}},
      {$lookup:{from:"users",localField:"userId",foreignField:"_id",as:"customer"}},{ $unwind:"$customer"},
      {$lookup:{from:"vehicles",localField:"vehicleId",foreignField:"_id",as:"vehicle"}},{ $unwind:"$vehicle"},
      {$lookup:{from:"categories",localField:"categoryId",foreignField:"_id",as:"category"}},{ $unwind:"$category"},
      { $lookup: { from: "users", localField: "mechanicId", foreignField: "_id", as: "mechanic" } },
      {$project:{
        status:1,
        visitType:1,
        schedule:1,
        additionalInfo:1,
        job:1,
        proof:1,
        statusTimeline: 1,
        advancePayment:1,
        pickupLocation:1,
        customerName:"$customer.name",
        customerPhone:"$customer.phoneNumber",
        vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
        vehicleType:"$vehicle.vehicleType",
        vehicleBrand:"$vehicle.brand",
        vehicleModel:"$vehicle.model",
        vehiclePhotoUrl:"$vehicle.documents.vehicleImage",
        categoryName:"$category.name",
        mechanicName:{$first:"$mechanic.name"}
      }}
    ])
    return result[0] ?? null
  }
  async findByUser(userId: string, page: number, limit: number, status?: string, search?: string): Promise<PaginatedResponse<any>> {
    
    const skip = ( page -1)*limit 
    const match : Record<string,any> = { userId: new Types.ObjectId(userId)}
    if(status){
        match.status == status 
    }
    const pipeline : any[]=[{$match:match},{$sort:{createdAt:-1}},
      {$lookup:{from:"vehicles",localField:"vehicleId",foreignField:"_id",as:"vehicle"}},
      {$unwind:"$vehicle"},
      {$lookup:{from:"categories",localField:"categoryId",foreignField:"_id",as:"category"}},
      {$unwind:"$category"},
      {$lookup:{from:"servicecenters",localField:"serviceCenterId",foreignField: "_id",as:"serviceCenter"}},
      {$unwind:"$serviceCenter"},
      ...(search?[{$match:{$or:[{"vehicle.RegistrationNumber":{ $regex:search, $options: "i"}},
        {"category.name":{$regex:search,$options:"i"}},
        {"serviceCenter.providerProfile.garageName":{$regex:search,$options:"i"}}
      ]}}]:[]),{
        $facet:{
          data:[{$skip:skip},{$limit:limit},{
            $project:{
              _id:1,
              vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
              vehiclePhotoUrl:"$vehicle.documents.vehicleImage",
              categoryName: "$category.name",
              garageName: "$serviceCenter.providerProfile.garageName",
              visitType: 1,
              schedule: 1,
              status: 1,
              advancePayment: 1,
            }
          }],
          totalCount:[{$count:"count"}]
        }
      }
    ];
    //console.log(pipeline,"pipline")
    const result = await Booking.aggregate(pipeline)
    
    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount?.[0]?.count??0

    return { data,total,page,limit,totalPages:Math.max(1,Math.ceil(total/limit))}
  }

async  findUserBookingDetails(bookingId: string, userId: string): Promise<any | null> {
    
    const result = await Booking.aggregate([
    { $match: { _id: new Types.ObjectId(bookingId), userId: new Types.ObjectId(userId) } },
    { $lookup: { from: "vehicles", localField: "vehicleId", foreignField: "_id", as: "vehicle" } },
    { $unwind: "$vehicle" },
    { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    { $lookup: { from: "servicecenters", localField: "serviceCenterId", foreignField: "_id", as: "serviceCenter" } },
    { $unwind: "$serviceCenter" },
    { $lookup: { from: "users", localField: "mechanicId", foreignField: "_id", as: "mechanic" } },
    {
      $project: {
        status: 1,
        visitType: 1,
        schedule: 1,
        additionalInfo: 1,
        job: 1,
        proof: 1,
        statusTimeline: 1,
        advancePayment: 1,
        pickupLocation: 1,
        vehicleRegistrationNumber: "$vehicle.RegistrationNumber",
        vehicleType: "$vehicle.vehicleType",
        vehicleBrand: "$vehicle.brand",
        vehicleModel: "$vehicle.model",
        vehiclePhotoUrl: "$vehicle.documents.vehicleImage",
        categoryName: "$category.name",
        garageName: "$serviceCenter.providerProfile.garageName",
        garagePhone: "$serviceCenter.providerProfile.phone",
        garageEmail: "$serviceCenter.email",
        garageAddress: "$serviceCenter.providerProfile.formattedAddress",
        mechanicName: { $first: "$mechanic.name" },
      },
    },
  ]);
  return result[0] ?? null;
}

async markRefuns(bookingId: string, serviceCenterId: string, markedBy: string): Promise<IBooking | null> {
  
  return Booking.findOneAndUpdate({_id:bookingId,serviceCenterId:new Types.ObjectId(serviceCenterId),"advancePayment.status":"refund_due"},
  { $set:{"advancePayment.status":"refunded",
    "advancePayment.refundedAt":new Date(),
    "advancePayment.refundedBy":markedBy
  }},
  {new:true}
)
}
}
