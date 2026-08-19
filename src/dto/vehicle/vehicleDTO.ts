export interface CreateVehicleDTO{
  vehicleType: string;
  brand: string;
  model: string;
  RegistrationNumber: string;
  RCNumber: string;
  FuelType: string;
  year: number;
  odometer: number;
  lastNotedKms: number;
  insuranceExpiryDate: Date;
}
export interface VehicleResponseDTO {
  id: string;
  userId: string;
  vehicleType: string;
  brand: string;
  model: string;
  RegistrationNumber: string;
  RCNumber: string;
  FuelType: string;
  year: number;
  odometer: number;
  lastNotedKms: number;
  insuranceExpiryDate: Date;
  documents: {
    vehicleImage: string;
    RCDocument: string;
    POCDocument: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}