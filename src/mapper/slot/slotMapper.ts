import { ISlot } from "../../interface/slot/ISlot";
import { SlotResponseDTO } from "../../dto/slot/slotResponseDTO";

export class SlotMapper {
  static toResponseDTO(slot: ISlot): SlotResponseDTO {
    return {
      time: slot.time,
      maxBooking: slot.MaxBooking, 
     bookedCount: slot.bookedCount,
      status: slot.status,
    };
  }
}
