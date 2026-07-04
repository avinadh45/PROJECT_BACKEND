import { Request, Response } from "express";
import { categorySchema } from "../../validation/category";
import { success, ZodError } from "zod";
import { ICategoryService } from "../../interface/category/ICategoryService";
import { HttpStatus } from "../../enums/httpstatus";
import { MESSAGES } from "../../constants/message";
import { upload } from "../../middleware/upload";
import { CategoryQueryDTO } from "../../interface/common/pagination";
import { asyncHandler } from "../../utils/asyncHandler";

export class CategoryController {
  constructor(private _category: ICategoryService) {}

   createCategory = asyncHandler(async(req: Request, res: Response)=> {
      const { name, advanceFee } = req.body;
      const file = req.file as any;
      const icon = file?.path;
      const public_id = file?.filename;
     // console.log("FILE:", req.file);
      try {
        
      categorySchema.parse({
        name,
        advanceFee: Number(advanceFee),
      });
      } catch (error) {
        if(error instanceof ZodError){
          const formattedErrors: Record<string,string> = {}
          error.issues.forEach((err)=>{
            const field = err.path[0] as string 
             formattedErrors[field] = err.message
          })
          return res.status(HttpStatus.BAD_REQUEST).json({success:false,errors:formattedErrors})
        }
      }
      
      const result = await this._category.createCategory({
        name,
        advanceFee: Number(advanceFee),
        icon,
        public_id,
      });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        data: result,
      });
  })

 getCategory = asyncHandler(async(req: Request, res: Response)=> {
    
      const query: CategoryQueryDTO = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 5,
        status: req.query.status as "active" | "inactive",
      };
      const categories = await this._category.getAllCategory(query);
      return res.status(HttpStatus.OK).json({
        success: true,
        ...categories,
      });
    
  })

 deleteCategory =  asyncHandler(async(req: Request<{ id: string }>, res: Response)=> {
      const { id } = req.params;
      await this._category.deleteCategory(id);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: MESSAGES.ADMIN.DELETE_CATEGORY });
  })

 updateCategory = asyncHandler(async(req: Request<{ id: string }>, res: Response)=> {
    
      const { id } = req.params;
      const data = req.body;
      const file = req.file;
      const update = await this._category.updateCategory(id, data, file);
      return res.status(HttpStatus.OK).json({ success: true, data: update });
    
  })
   block = asyncHandler(async(req: Request<{ id: string }>, res: Response)=> {
  
      const { id } = req.params;
      const updated = await this._category.blockUnblock(id);
      return res.status(HttpStatus.OK).json({ success: true, data: updated });
    
  })

  alreadyExist = asyncHandler(async(req:Request<{data:string}>,res:Response)=>{

    const data = req.body
    const category = await this._category.AlreadyExist(data)
    return res.status(HttpStatus.OK).json({success:true,data:category})
  })
}

