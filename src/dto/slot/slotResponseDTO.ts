export interface SlotResponseDTO{
    time:string;
    maxBooking:number;
    bookingCount:number;
    status: "available" | "full" | "blocked";
}