import ServiceCenter from "../../model/ServiceCenterModel";
import {
  IServiceCenter,
  ServiceOfferedInput,
} from "../../interface/ServiceCenter/IServiceCenter";
import { IServiceCenterRepository } from "../../interface/ServiceCenter/IServiceCenterRepository";
import { PaginatedResponse } from "../../interface/common/pagination";
import { Types } from "mongoose";

export class ServiceCenterRepository implements IServiceCenterRepository {
  async findByEmail(email: string): Promise<IServiceCenter | null> {
    return ServiceCenter.findOne({ email });
  }

  async findServiceCenterByToken(
    token: string,
  ): Promise<IServiceCenter | null> {
    return await ServiceCenter.findOne({ resetToken: token });
  }
  async createServiceCenter(
    data: Partial<IServiceCenter>,
  ): Promise<IServiceCenter> {
    return ServiceCenter.create(data);
  }
  async findAll(
    page: number,
    limit: number,
    search: string = "",
  ): Promise<PaginatedResponse<IServiceCenter>> {
    const skip = (page - 1) * limit;
    const query: Record<string, any> = search
      ? {
          $or: [
            { email: { $regex: search, $options: "i" } },
            { "providerProfile.garageName": { $regex: search, $options: "i" } },
            { "providerProfile.ownerName": { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const serviceCenter = await ServiceCenter.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await ServiceCenter.countDocuments(query);
    return {
      data: serviceCenter,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<IServiceCenter | null> {
    return ServiceCenter.findById(id).populate("servicesOffered.serviceId");
  }
  async updateServiceCenter(
    id: string,
    data: Partial<IServiceCenter>,
  ): Promise<IServiceCenter | null> {
    return await ServiceCenter.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    });
  }

  async findPendingServiceCenter(): Promise<IServiceCenter[]> {
    return await ServiceCenter.find({ verificationStatus: "pending" }).sort({
      createdAt: -1,
    });
  }

  async findWithService(
    id: string,
    page: number,
    limit: number,
    search: string,
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const result = await ServiceCenter.aggregate([
      { $match: { _id: new Types.ObjectId(id) } },
      { $unwind: "$servicesOffered" },
      {
        $lookup: {
          from: "categories",
          localField: "servicesOffered.serviceId",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      ...(search
        ? [
            {
              $match: {
                "categoryInfo.name": { $regex: search, $options: "i" },
              },
            },
          ]
        : []),
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                serviceId: {
                  _id: "$categoryInfo._id",
                  name: "$categoryInfo.name",
                  icon: "$categoryInfo.icon",
                  advanceFee: "$categoryInfo.advanceFee",
                },
                advanceFee: "$servicesOffered.advanceFee",
                status: "$servicesOffered.status",
                vehicleTypes: "$servicesOffered.vehicleTypes",
                serviceModes: "$servicesOffered.serviceModes",
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const data = result[0]?.data ?? [];
    const total = result[0]?.totalCount?.[0]?.count ?? 0;

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
  async updateServiceFee(
    serviceCenterId: string,
    serviceId: string,
    advanceFee: number | null,
  ): Promise<IServiceCenter | null> {
    return await ServiceCenter.findOneAndUpdate(
      { _id: serviceCenterId, "servicesOffered.serviceId": serviceId },
      { $set: { "servicesOffered.$[elem].advanceFee": advanceFee } },
      {
        arrayFilters: [{ "elem.serviceId": serviceId }],
        returnDocument: "after",
      },
    )
      .populate("servicesOffered.serviceId", "name icon advanceFee")
      .lean();
  }

  addService(
    serviceCenterId: string,
    service: ServiceOfferedInput,
  ): Promise<IServiceCenter | null> {
    return ServiceCenter.findByIdAndUpdate(
      serviceCenterId,
      { $push: { servicesOffered:service } },
      { returnDocument: "after" },
    )
      .populate("servicesOffered.serviceId", "name icon advanceFee")
      .lean();
  }

  async checkExistingService(serviceCenterId: string, serviceId: string): Promise<boolean> {
      const result = await ServiceCenter.exists({_id:serviceCenterId,"servicesOffered.serviceId":serviceId})
      return !! result
  }
  async  toggleServiceStatus(serviceCenterId: string, serviceId: string, status: "active" | "inactive"): Promise<IServiceCenter | null> {
    return await ServiceCenter.findOneAndUpdate({_id:serviceCenterId,"servicesOffered.serviceId":serviceId},{$set:{"servicesOffered.$[elem].status":status}},
      {arrayFilters:[{"elem.serviceId":serviceId}],returnDocument:"after"}
    ).populate("servicesOffered.serviceId","name icon advanceFee").lean()
  }
}
