import express from "express"; 

import { DashboardController } from "../../controller/dashboard/dashboardController";
import { DashboardService } from "../../service/dashboard/dashboardService";
import { DashboardRepository } from "../../repository/dashboard/DashboardRepository";
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter";

const router = express.Router() 

const dashboardRepo = new DashboardRepository()
const dashboardService  = new DashboardService(dashboardRepo)
const controller = new DashboardController(dashboardService)

router.get("/summary",verifyServiceCenter, controller.getSummay);
router.get("/trends",verifyServiceCenter, controller.getTrends);
router.get("/today",verifyServiceCenter,controller.getToday)

export default router