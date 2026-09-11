import { IConcern } from "../../interface/concern/IConcern";
import { ConcernSummaryDTO } from "../../dto/concern/concernDTO";

export class ConcernMapper{

    static toSummaryDTO(concern:IConcern):ConcernSummaryDTO{
        return {
            id:concern._id.toString(),
            bookingId: concern.bookingId.toString(),
            issueTitle:concern.issueTittle,
            status:concern.status,
            createdAt:concern.createAt!
        }
    }
}