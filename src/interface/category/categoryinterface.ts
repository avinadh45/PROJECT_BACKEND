import { Types } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId;

  name: string;
  advanceFee?: number;
  icon?: string;
  status?: "active" | "inactive";
public_id?: string;

  createdAt?: Date;
  updatedAt?: Date;
}