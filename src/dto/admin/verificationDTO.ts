export interface VerificationDetailsDTO {

  id: string;

  email: string;

  verificationStatus: string;

  providerProfile: {

    ownerName: string;

    garageName: string;

    phone: string;

    location: {
      type: "Point";
      coordinates: number[];
    };

    documents: {

      garageLicense: {
        url: string;
      };

      ownerIdProof: {
        url: string;
      };
    };
  };
   availability: {

    workingDays: string[];

    workingHours: {

      start: string;

      end: string;
    };
  };
 servicesOffered: {
  serviceId:{name:string}
    vehicleTypes: string[];
    serviceModes: string[];
  }[];
  createdAt?: Date;
}