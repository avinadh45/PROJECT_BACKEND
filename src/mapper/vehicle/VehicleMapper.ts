import { IVehicle, IVehicleDocuments } from "../../interface/Vehicle/IVehicle";
import {
  CreateVehicleDTO,
  VehicleResponseDTO,
} from "../../dto/vehicle/vehicleDTO";
import { Types } from "mongoose";

export class VehicleMapper {
  static toDomain(
    userId: string,
    dto: CreateVehicleDTO,
    documents: {
      vehicleImage: string;
      RCDocument: string;
      POCDocument: string;
    },
  ): Partial<IVehicle> {
    return {
      userId: new Types.ObjectId(userId),
      vehicleType: dto.vehicleType,
      brand: dto.brand,
      model: dto.model,
      RegistrationNumber: dto.RegistrationNumber,
      RCNumber: dto.RCNumber,
      FuelType: dto.FuelType,
      year: dto.year,
      odometer: dto.odometer,
      lastNotedKms: dto.lastNotedKms,
      insuranceExpiryDate: new Date(dto.insuranceExpiryDate),
      documents,
    };
  }

  static toResponseDTO(vehicle: IVehicle): VehicleResponseDTO {
    return {
      id: vehicle._id!.toString(),
      userId: vehicle.userId.toString(),
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      RegistrationNumber: vehicle.RegistrationNumber,
      RCNumber: vehicle.RCNumber,
      FuelType: vehicle.FuelType,
      year: vehicle.year,
      odometer: vehicle.odometer,
      lastNotedKms: vehicle.lastNotedKms,
      insuranceExpiryDate: vehicle.insuranceExpiryDate,
      documents: vehicle.documents,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }
  static toUpdateDomain(
    body: Partial<CreateVehicleDTO>,
    documents: Partial<IVehicleDocuments>,
  ): Partial<IVehicle> {
    const result: Partial<IVehicle> = {};

    if (body.vehicleType) result.vehicleType = body.vehicleType;
    if (body.FuelType) result.FuelType = body.FuelType;
    if (body.brand) result.brand = body.brand;
    if (body.model) result.model = body.model;
    if (body.RegistrationNumber)
      result.RegistrationNumber = body.RegistrationNumber;
    if (body.RCNumber) result.RCNumber = body.RCNumber;
    if (body.year) result.year = Number(body.year);
    if (body.odometer) result.odometer = Number(body.odometer);
    if (body.lastNotedKms) result.lastNotedKms = Number(body.lastNotedKms);
    if (body.insuranceExpiryDate)
      result.insuranceExpiryDate = new Date(body.insuranceExpiryDate);
    if (Object.keys(documents).length > 0)
      result.documents = documents as IVehicleDocuments;

    return result;
  }
}
