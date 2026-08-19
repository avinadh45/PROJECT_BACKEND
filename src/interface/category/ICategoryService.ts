import { CategoryResponseDTO } from "../../dto/category/responseDTO";
import { CreateCategoryDTO } from "../../dto/category/createCategoryDTO";
import { UpdateCategoryDTO } from "../../dto/category/updateCtegoryDTO";
import { PaginatedResponse,CategoryQueryDTO } from "../common/pagination";

 export interface ICategoryService{
    createCategory(data:CreateCategoryDTO):Promise<CategoryResponseDTO>
    getAllCategory(query:CategoryQueryDTO):Promise<PaginatedResponse<CategoryResponseDTO>>
    deleteCategory(id:string):Promise<void>
    updateCategory(id:string,data:UpdateCategoryDTO,file?: Express.Multer.File):Promise<CategoryResponseDTO>
    blockUnblock(id:string):Promise<CategoryResponseDTO>
    checkNameExist(name:string):Promise<Boolean>
   
 }