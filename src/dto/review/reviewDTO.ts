
export interface ReviewResponseDTO { 

    id:string;
    rating:number;
    comment?:string;
    createdAt:Date;
    userName:string;
    edited: boolean
}

export interface BookingReviewDTO { 
    review:ReviewResponseDTO | null ;
    canReview: boolean
}