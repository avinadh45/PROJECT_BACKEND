import { z } from "zod";
export const serviceCenterRegisterSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email format"),

  password: z
    .string()
    .min(6, "Password must contain atleast 6 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
      "Password must contain uppercase, lowercase and number"
    ),

  providerProfile: z.object({
    ownerName: z
      .string()
      .trim()
      .min(3, "Owner name must contain atleast 3 characters"),

    garageName: z
      .string()
      .trim()
      .min(3, "Garage name must contain atleast 3 characters"),

    phone: z
      .string()
      .regex(
        /^[6-9]\d{9}$/,
        "Phone number must be a valid 10 digit Indian number"
      ),

    verificationStatus: z.string().optional(),

    location: z.object({
      type: z.literal("Point"),

      coordinates: z
        .array(z.number())
        .length(2, "Coordinates must contain longitude and latitude"),
    }),

    documents: z.object({
      garageLicense: z.object({
        url: z.string().min(1, "Garage license is required"),

        public_id: z.string().min(1),
      }),

      ownerIdProof: z.object({
        url: z.string().min(1, "Owner ID proof is required"),

        public_id: z.string().min(1),
      }),
    }),
  }),

  availability: z.object({
    workingDays: z
      .array(z.string())
      .min(1, "Select atleast one working day"),

    workingHours: z.object({
      start: z.string().min(1, "Start time is required"),

      end: z.string().min(1, "End time is required"),
    }),

    slotDuration: z.number().optional(),

    maxBookingsPerSlot: z.number().optional(),
  }),

  servicesOffered: z
    .array(
      z.object({
        serviceId: z.string().min(1, "Service ID required"),

        vehicleTypes: z
          .array(z.string())
          .min(1, "Select atleast one vehicle type"),

        serviceModes: z
          .array(z.string())
          .min(1, "Select atleast one service mode"),
      })
    )
    .min(1, "Atleast one service must be selected"),
});