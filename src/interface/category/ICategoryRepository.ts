import { ICategory } from "./categoryinterface";
import { CategoryQueryDTO,PaginatedResponse } from "../common/pagination";
export interface ICatergoryCreateRepository{
    createCategory(data:Partial<ICategory>):Promise<ICategory>
    deleteCategory(id:string):Promise<void>
    updateCategory(id:string,data:Partial<ICategory>):Promise<ICategory | null>
   
}
export interface ICategoryReadRepository{
     getAll(query:CategoryQueryDTO):Promise<PaginatedResponse<ICategory>>
     findbyId(id:string):Promise<ICategory | null>
     findByName(name:string):Promise<ICategory | null>
     findAllCategories():Promise<ICategory[]>
}
