export interface GarageSearchResultDTO {
  id: string;
  garageName: string;
  garageProfileImage?: string;
  formattedAddress?: string;
  advanceFee: number | null;
  distanceInKm?: number;
}