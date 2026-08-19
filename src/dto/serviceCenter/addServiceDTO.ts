export interface AddServiceDTO{ 
    serviceId:string,
    advanceFee?:number | null,
    vehicleTypes:string[],
    serviceModes:string[]
}