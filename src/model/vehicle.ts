import mongoose,{Schema} from "mongoose";
import { IVehicleDocument } from "../interface/Vehicle/IVehicle";

const VehicleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleType: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    RegistrationNumber: { type: String, required: true },
    RCNumber: { type: String, required: true },
    FuelType: { type: String, required: true },
    year: { type: Number, required: true },
    odometer: { type: Number, required: true },
    lastNotedKms: { type: Number, required: true },
    insuranceExpiryDate: { type: Date, required: true },
    documents: {
      vehicleImage: { type: String, required: true },
      RCDocument: { type: String, required: true },
      POCDocument: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const VehicleModel = mongoose.model<IVehicleDocument>(
  "Vehicle",
  VehicleSchema
);