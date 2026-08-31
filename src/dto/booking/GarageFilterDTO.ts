export interface GarageFilterDTO {
  categoryId: string;
  vehicleType: string;
  serviceMode: "drive-in" | "pickup-drop";
  latitude?: number;
  longitude?: number;
}