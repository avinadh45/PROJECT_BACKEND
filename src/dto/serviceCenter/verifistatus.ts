export interface VerificationStatusDTO {

   status: "pending" | "approved" | "rejected";

   garageName: string;

   submittedAt?: Date;

   reviewedAt?: Date;

   rejectionReason?: string;

   rejectionDetails?: string;

}