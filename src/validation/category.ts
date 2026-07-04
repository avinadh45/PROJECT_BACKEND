import { z } from "zod";

export const categorySchema = z.object({

  name: z
    .string()
    .trim()
    .min(
      3,
      "Category name must be at least 3 characters"
    ),

  advanceFee: z
    .number()
    .min(0, "Invalid advance fee"),

});