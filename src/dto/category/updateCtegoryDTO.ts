export interface UpdateCategoryDTO {
  name?: string;
  advanceFee?: number;
   status?: "active" | "inactive";
   public_id?: string;
  icon?: string; 
}