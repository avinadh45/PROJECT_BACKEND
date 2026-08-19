import { z } from "zod";
export const updateAvailabilitySchema = z.object({
  workingDays: z.array(z.string()).min(1, { error: "At least one working day is required" }),
  workingHours: z.object({
    start: z.string().min(1),
    end: z.string().min(1),
  }),
  slotDuration: z.number().positive(),
  maxBookingsPerSlot: z.number().positive(),
});