import { Router } from "express";
import { CategoryController } from "../../controller/category/categoryController";
import { CategoryService } from "../../service/category/categoryService";
import { Category} from "../../model/categoryModel"

import { CategoryRepository } from "../../repository/category/CategoryRepository";
import { upload } from "../../middleware/upload";

const  router = Router();

const repo = new CategoryRepository(Category)
const service = new CategoryService(repo,repo)
const controller = new CategoryController(service)

router.post("/",upload.single("icon"),controller.createCategory.bind(controller))
router.get("/",controller.getCategory.bind(controller))
router.get("/services",controller.getCategory)
router.delete("/:id",controller.deleteCategory.bind(controller))
router.put("/:id",upload.single("icon"),controller.updateCategory.bind(controller))
router.patch("/:id/status",controller.block.bind(controller))
router.get("/check-name",controller.checkNameExist)

export default router