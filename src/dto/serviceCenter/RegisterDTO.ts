  export interface ServiceCenterRegisterDTO {
    email: string;
    password: string;

    providerProfile: {
      ownerName: string;
      garageName: string;
      phone: string;
      verificationStatus: string;
      location: {
        type: "Point";
        coordinates: number[];
      };
      documents:{
        garageLicense:{
          url:string;
          public_id:string
        }
        ownerIdProof:{
          url:string;
          public_id:string
        }
      }
    };
    availability:{
      workingDays:string[];
      workingHours:{
        start:string;
        end:string
      }
       slotDuration?: number;

  maxBookingsPerSlot?: number;
    }
        servicesOffered: {
          serviceId: string;
          vehicleTypes: string[];
      serviceModes: string[];
      }[];
  }