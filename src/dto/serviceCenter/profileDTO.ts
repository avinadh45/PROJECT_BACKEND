export interface ServiceOfferedDTO {

    serviceId:string;
    name:string;
    icon?:string;
    advanceFee: number | null;
    vehicleTypes:string[];
    serviceModes:string[];
}

export interface ServiceCentersProfileDTO {

    id:string;
    email:string;
    garageName:string;
    ownerName:string;
    phone:string;
    garageProfileImage:{ url: string; public_id: string }[]; 
    formattedAddress?:string;
    location?: { type: "Point"; coordinates: number[] };
    availability?:{
        workingDays: string[];
        workingHours: { start: string; end: string };
    }
    vehicleTypesHandled: string[];
    servicesOffered: ServiceOfferedDTO[]
}

export interface UpdateGarageProfileDTO {
  garageName?: string;
  ownerName?: string;
  phone?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface PublicGarageDTO {

    id:string;
    garageName:string; 
    images: string[];
    formattedAddress?: string; 
    location?: { lat:number; lng:number};
    availability?:{
        workingDay: string[];
        workingHours: { start:string; end:string}
    };
    vehicleTypes:string[];
    services:{
        serviceId:string;
        name:string;
        icon?:string;
        advanceFee:number | null;
        vehicleTypes: string[];
        serviceMode:string[];
    }[],
    rating?: number;
reviewCount: number;

}