export interface AvailabilityResponseDTO{
  workingDays: string[];
  workingHours: { start: string; end: string };
  slotDuration: number;
  maxBookingsPerSlot: number;
}