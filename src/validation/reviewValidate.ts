import { z } from "zod"; 

export const createReviewSchema = z.object({

    rating: z.number().int().min(1,"Select a rating").max(5) ,
    comment: z.string().trim().max(500,"Comment is too long").optional(),
})

export type CreateReviewDTO = z.infer<typeof createReviewSchema>

export const updateReviewSchema = createReviewSchema;