import { Model } from "mongoose";
import { ICategory } from "../../interface/category/categoryinterface";
import {
  CategoryQueryDTO,
  PaginatedResponse,
} from "../../interface/common/pagination";
import {
  ICategoryReadRepository,
  ICatergoryCreateRepository,
} from "../../interface/category/ICategoryRepository";

export class CategoryRepository
  implements ICatergoryCreateRepository, ICategoryReadRepository
{
  constructor(private Model: Model<ICategory>) {}

  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    return await this.Model.create(data);
  }
  async getAll(Query: CategoryQueryDTO): Promise<PaginatedResponse<ICategory>> {
    const { page, limit, status } = Query;
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    const [category, total] = await Promise.all([
      this.Model.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.Model.countDocuments(filter),
    ]);
    return {
      data: category,
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    };
    // return await this.Model.find().sort({ createdAt:-1})
  }
  async deleteCategory(id: string): Promise<void> {
    await this.Model.findByIdAndDelete(id);
  }
  async findbyId(id: string): Promise<ICategory | null> {
    return this.Model.findById(id);
  }
  async updateCategory(
    id: string,
    data: Partial<ICategory>,
  ): Promise<ICategory | null> {
    return await this.Model.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: "after" },
    );
  }
  async findByName(name: string): Promise<ICategory | null> {
    return await this.Model.findOne({name:{$regex:new RegExp(`^${name}$`,"i")}})
  }
}
