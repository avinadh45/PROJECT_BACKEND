export interface SlotResponseDTO{
    time:string;
    maxBooking:number;
    bookedCount:number;
    status: "available" | "full" | "blocked";
}