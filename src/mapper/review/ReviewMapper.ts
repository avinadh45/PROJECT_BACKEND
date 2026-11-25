import { maskName } from "../../utils/maskName";
import type { ReviewResponseDTO } from "../../dto/review/reviewDTO";

export class ReviewMapper {
    
    static toDTO(doc:any,nameOverride?:string):ReviewResponseDTO { 

        return {

            id:doc._id.toString(),
            rating: doc.rating,
            comment: doc.comment,
            createdAt: doc.createdAt,
            userName: nameOverride ?? maskName(doc.userName),
            edited: !!doc.updatedAt && !!doc.createdAt 
        }
    }
}