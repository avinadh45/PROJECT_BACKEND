import { z } from "zod";

export const updateGarageProfileSchema = z
  .object({
    garageName: z.string().trim().min(2, "Garage name must be at least 2 characters").optional(),
    ownerName: z.string().trim().min(2, "Owner name must be at least 2 characters").optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
      .optional(),
    formattedAddress: z.string().trim().max(200, "Address is too long").optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine((d) => (d.latitude === undefined) === (d.longitude === undefined), {
    error: "Both latitude and longitude are required",
    path: ["latitude"],
  })
  .refine((d) => Object.keys(d).length > 0, { error: "Nothing to update" });

export type UpdateGarageProfileDTO = z.infer<typeof updateGarageProfileSchema>;