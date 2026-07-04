import { ICategory } from "../../interface/category/categoryinterface";
import { CategoryResponseDTO } from "../../dto/category/responseDTO";
import { CreateCategoryDTO } from "../../dto/category/createCategoryDTO";

export class CategoryMapper {

  static toEntity(dto: CreateCategoryDTO): Partial<ICategory> {
    return {
      name: dto.name,
      advanceFee: dto.advanceFee,
      icon: dto.icon,
       public_id: dto.public_id,
      status: "active"
    };
  }

  
  static toResponseDTO(service: ICategory): CategoryResponseDTO {
    return {
      id: service._id.toString(),
      name: service.name,
      advanceFee: service.advanceFee || 0,
      icon: service.icon || "",
      status: service.status || "active",
      createdAt: service.createdAt
        ? service.createdAt.toISOString()
        : "",
    };
  }
}