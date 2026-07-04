import { ICategoryService } from "../../interface/category/ICategoryService";
import {
  ICategoryReadRepository,
  ICatergoryCreateRepository,
} from "../../interface/category/ICategoryRepository";
import { CategoryMapper } from "../../mapper/category/categoryMapper";
import { CreateCategoryDTO } from "../../dto/category/createCategoryDTO";
import { CategoryResponseDTO } from "../../dto/category/responseDTO";
import cloudinary from "../../config/cloudinary";
import { HttpStatus } from "../../enums/httpstatus";
import { AppError } from "../../utils/AppError";
import { UpdateCategoryDTO } from "../../dto/category/updateCtegoryDTO";
import {
  CategoryQueryDTO,
  PaginatedResponse,
} from "../../interface/common/pagination";
import { ICategory } from "../../interface/category/categoryinterface";
export class CategoryService implements ICategoryService {
  constructor(
    private _createrepo: ICatergoryCreateRepository,
    private _readRepo: ICategoryReadRepository,
  ) {}

  async createCategory(data: CreateCategoryDTO): Promise<CategoryResponseDTO> {

    if(!data.name.trim()){
      throw new Error("name is required")
    }
    if(data.name.trim().length < 3){
      throw new Error("Category name must be at least 3 characters")
    }
    if(data.advanceFee < 0){
      throw new Error("Invalid advance fee")
    }

    const existing = await this._readRepo.findByName(data.name)
    if(existing){
      throw new AppError("already exist",HttpStatus.CONFLICT)
    }
    const category = await this._createrepo.createCategory(data);
    return CategoryMapper.toResponseDTO(category);
  }

  async getAllCategory(
    query: CategoryQueryDTO,
  ): Promise<PaginatedResponse<CategoryResponseDTO>> {
    const categories = await this._readRepo.getAll(query);
    return {
      ...categories,
      data: categories.data.map(CategoryMapper.toResponseDTO),
    };
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this._readRepo.findbyId(id);
    if (!category) {
      throw new Error("no category");
    }
    if (category.public_id) {
      await cloudinary.uploader.destroy(category.public_id);
    }
    await this._createrepo.deleteCategory(id);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDTO,
    file?: Express.Multer.File,
  ): Promise<CategoryResponseDTO> {
    const category = await this._readRepo.findbyId(id);
    if (!category) {
      throw new Error("category not found");
    }
    let imageURL = category.icon;
    let public_id = category.public_id;
    if (file) {
      if (category.public_id) {
        await cloudinary.uploader.destroy(category.public_id);
      }
      const result = await cloudinary.uploader.upload(file.path);
      imageURL = result.secure_url;
      public_id = result.public_id;
    }
    const upload = await this._createrepo.updateCategory(id, {
      ...data,
      icon: imageURL || "",
      public_id: public_id || "",
    });
    if (!upload) {
      throw new Error("update failed");
    }
    return CategoryMapper.toResponseDTO(upload);
  }

  async blockUnblock(id: string): Promise<CategoryResponseDTO> {
    const category = await this._readRepo.findbyId(id);
    if (!category) {
      throw new Error(" no category found");
    }
    const blockun = category.status === "active" ? "inactive" : "active";
    const data = await this._createrepo.updateCategory(id, { status: blockun });
    if (!data) {
      throw new Error("Update failed");
    }

    return CategoryMapper.toResponseDTO(data);
  }
  async AlreadyExist(data: string): Promise<ICategory> {
    const category = await this._readRepo.findByName(data)
    if(!category){
      throw new AppError("already here",HttpStatus.CONFLICT)
    }
    return category
  } 
}
