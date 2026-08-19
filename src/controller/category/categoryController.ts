import { Request, Response } from "express";
import { categorySchema } from "../../validation/category";
import { success, ZodError } from "zod";
import { ICategoryService } from "../../interface/category/ICategoryService";
import { HttpStatus } from "../../enums/httpstatus";
import { MESSAGES } from "../../constants/message";
import { upload } from "../../middleware/upload";
import { CategoryQueryDTO } from "../../interface/common/pagination";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";

export class CategoryController {
  constructor(private _category: ICategoryService) {}

   createCategory = asyncHandler(async(req: Request, res: Response)=> {
      const { name, advanceFee } = req.body;
      const file = req.file as any;
      const icon = file?.path;
      const public_id = file?.filename;
       const validation = categorySchema.safeParse({ name, advanceFee: Number(advanceFee) });
  if (!validation.success) {
    const formattedErrors: Record<string, string> = {};
    validation.error.issues.forEach((err) => {
      formattedErrors[err.path[0] as string] = err.message;
    });
    return res.status(HttpStatus.BAD_REQUEST).json({ success: false, errors: formattedErrors });
  } 
      const result = await this._category.createCategory({
        name,
        advanceFee: Number(advanceFee),
        icon,
        public_id,
      });
      return sendSuccess(res,result,MESSAGES.ADMIN.CATEGORY_CREATED,HttpStatus.CREATED)
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
      return sendSuccess(res,null,MESSAGES.ADMIN.DELETE_CATEGORY,HttpStatus.OK)
  })

 updateCategory = asyncHandler(async(req: Request<{ id: string }>, res: Response)=> {
      const { id } = req.params;
      const data = req.body;
      const file = req.file;
      const update = await this._category.updateCategory(id, data, file);
      return sendSuccess(res,update,MESSAGES.ADMIN.UPDATE_CATEGORY,HttpStatus.OK)
    
  })

   block = asyncHandler(async(req: Request<{ id: string }>, res: Response)=> {
      const { id } = req.params;
      const updated = await this._category.blockUnblock(id);
      return sendSuccess(res,updated,MESSAGES.ADMIN.BLOCK_CATEGORY,HttpStatus.OK)
  })
  checkNameExist = asyncHandler(async(req:Request,res:Response)=>{
    const {name} = req.query 
    const exist = await this._category.checkNameExist(name as string) 
    return sendSuccess(res,{exist},"Checked",HttpStatus.OK)
  })
}

