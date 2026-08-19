export interface ServiceCenterEditDTO {

  garageName: string;

  ownerName: string;

  phone: string;

  email: string;
 location: {
    type: "Point";
    coordinates: number[];
  };

  availability: {
    workingDays: string[];

    workingHours: {
      start: string;
      end: string;
    };
  };

servicesOffered: {
  serviceId: string;
  advanceFee: number | null;
  status?: string;
  vehicleTypes: string[];
  serviceModes: string[];
}[];

  documents: {
    garageLicense: {
      url: string;
      public_id: string;
    };

    ownerIdProof: {
      url: string;
      public_id: string;
    };
  };
}