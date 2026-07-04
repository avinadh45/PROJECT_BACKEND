export interface servicecenterDTO{
    id: string;
  name: string;        
  ownerName: string;   
  email: string;
  phoneNumber: string;
  verificationStatus: string;
  isBlocked?: boolean;
  createdAt?: Date;
}