import mongoose, { Schema } from "mongoose";
import { ICategory } from "../interface/category/categoryinterface";
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    advanceFee: {
      type: Number,
      default: 0,
    },

    icon: {
      type: String, 
      default: "",
    },

    public_id: {
  type: String,
  required: true
},
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, 
  }
);

export const Category = mongoose.model("Category", CategorySchema);