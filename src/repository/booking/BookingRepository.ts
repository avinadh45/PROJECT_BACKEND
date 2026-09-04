import { Types } from "mongoose";
import Booking from "../../model/bookingModel";
import { IBooking } from "../../interface/Booking/IBookking";
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

  async findById(bookingId: string): Promise<IBooking | null> {
    
    return await Booking.findById(bookingId)
  }
  async findByServiceCenter(serviceCenterId: string, page: number, limit: number, status?: string, search?: string): Promise<PaginatedResponse<any>> {
    
    console.log("findByServiceCenter called with:", { serviceCenterId, page, limit, status, search });

    const skip = ( page - 1)*limit 
    const matchStage: Record<string,any>={serviceCenterId: new Types.ObjectId(serviceCenterId)}

    if(status){
      matchStage.status = status
    }

    console.log("matchStage:", matchStage);

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
    console.log("full pipeline:", JSON.stringify(pipeline, null, 2));
     console.log("aggregate raw result:", JSON.stringify(result, null, 2));
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
      console.log("repo received bookingId:", bookingId, typeof bookingId)
  console.log("repo received mechanicId:", mechanicId, typeof mechanicId)
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
   console.log("aggregate result:", result)
  return result[0] ?? null;
  }
}
