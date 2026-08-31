export const VEHICLE_TYPES = ["Cars", "Bikes / Two-Wheelers"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];