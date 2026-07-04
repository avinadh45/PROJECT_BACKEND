import { z } from "zod";

export const CreateMechanicSchema = z.object({

    name: z.string().min(1,"Name is required").trim(),
    email: z.string().min(1,"Email is required").email("Invalid email"),
    password:z.string().min(6, "Password must be at least 6 characters"),
    garageId: z.string().optional(),
})
