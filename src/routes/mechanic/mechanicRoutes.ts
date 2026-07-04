import express from "express";
import { MechanicController } from "../../controller/mechanic/mechanic";
import { MechanicService } from "../../service/mechanic/mechanicService";
import { MechanicReadRepository } from "../../repository/mechanic/mechanicReadRepository";
import { MechanicWriteRepository } from "../../repository/mechanic/mechanicWriteRepository";
import { verifyMechanic } from "../../middleware/verifyMechanic";
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter";
const router = express.Router();

const readRepository = new MechanicReadRepository();
const writeRepository = new MechanicWriteRepository();
const service = new MechanicService(readRepository, writeRepository);
const controller = new MechanicController(service);

router.post("/create",  verifyServiceCenter, controller.createMechanic.bind(controller));
router.post("/login", controller.loginMechanic.bind(controller));
router.get('/list',verifyServiceCenter,controller.getMechanic.bind(controller))
router.get('/dashboard',verifyMechanic,controller.getDashboard)
export default router;
