export interface serviceCenterDetailsDTO {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phoneNumber: string;
  isBlocked?: boolean;
  createdAt?: Date;
}
