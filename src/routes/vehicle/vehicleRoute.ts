import { Router } from "express";
import { VehicleController } from "../../controller/vehicle/vehicleController";
import { VehicleSerice } from "../../service/vehicle/vehicleService";
import { VechileRepository } from "../../repository/vehicle/vehicleRepository";
import { authMiddleware } from "../../middleware/authMiddleware";
import { upload } from "../../middleware/upload";
import { validate } from "../../middleware/validation";
import { createVehicleSchema, updateVehicleSchema } from "../../validation/vehicleValidation";

const router = Router()

const vehicleRepo = new VechileRepository()
const vehicleService = new VehicleSerice(vehicleRepo,vehicleRepo)
const vehicleController = new VehicleController(vehicleService)

router.post("/add",authMiddleware,upload.fields([{name:"vehicleImage",maxCount:1},{name:"RCDocument",maxCount:1},{name:"POCDocument",maxCount:1}]),validate(createVehicleSchema),
vehicleController.addVehicle)
router.get("/my-vehicle",authMiddleware,vehicleController.vehicleList)
router.put("/update/:id",authMiddleware,upload.fields([{name:"vehicleImage",maxCount:1},{name:"RCDocument",maxCount:1},{name:"POCDocument",maxCount:1}]),validate(updateVehicleSchema),
vehicleController.updateVehicle)
router.get("/:id",authMiddleware,vehicleController.getVehicle)
router.delete("/delete/:id",authMiddleware,vehicleController.deleteVehicle)

export default router
