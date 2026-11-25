import { Router } from "express";
import { AdminDashboardRepository } from "../../repository/dashboard/AdminDashboardRepository";
import { AdminDashboard } from "../../service/dashboard/AdminDashboardService";
import { AdminDashboardController } from "../../controller/dashboard/AdminDashboardController";


const repository = new AdminDashboardRepository()
const service = new AdminDashboard(repository) 
const controller = new AdminDashboardController(service) 

const router = Router()

router.get("/attention",controller.getAttention)
router.get("/summary",controller.getSummary)
router.get("/trends",controller.getTrends)
router.get("/verification",controller.getVerification)

export default router
