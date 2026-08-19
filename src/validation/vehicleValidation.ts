import { z } from "zod";

export const createVehicleSchema = z.object({

    vehicleType:z.string().min(1,"Vehicle type is required"),
    FuelType: z.string().min(1, "Fuel type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .string()
    .regex(/^\d{4}$/, "Year must be 4 digits")
    .refine(y => +y >= 1990 && +y <= new Date().getFullYear(), "Invalid year"),
  odometer: z
    .string()
    .regex(/^\d+$/, "Odometer must be a number")
    .refine(v => +v >= 0, "Invalid odometer"),
  lastNotedKms: z
    .string()
    .regex(/^\d+$/, "Last noted km must be a number"),
  RegistrationNumber: z.string().min(1, "Registration number is required"),
  insuranceExpiryDate: z
    .string()
    .min(1, "Insurance expiry date is required"),
  RCNumber: z.string().min(1, "RC number is required"),
})
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>

export const updateVehicleSchema = z.object({
  vehicleType:         z.string().min(1, "Vehicle type is required").optional(),
  FuelType:            z.string().min(1, "Fuel type is required").optional(),
  brand:               z.string().min(1, "Brand is required").optional(),
  model:               z.string().min(1, "Model is required").optional(),
  year:                z.string().regex(/^\d{4}$/, "Year must be 4 digits").optional(),
  odometer:            z.string().regex(/^\d+$/, "Odometer must be a number").optional(),
  lastNotedKms:        z.string().regex(/^\d+$/, "Last noted km must be a number").optional(),
  RegistrationNumber:  z.string().min(1, "Registration number is required").optional(),
  insuranceExpiryDate: z.string().min(1, "Insurance expiry date is required").optional(),
  RCNumber:            z.string().min(1, "RC number is required").optional(),
}).refine(data => Object.values(data).some(v => v !== undefined), {
  message: "At least one field must be provided",
});