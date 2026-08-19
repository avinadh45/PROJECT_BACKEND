import express from "express"
import { SlotController } from "../../controller/slot/slotController"
import { SlotService } from "../../service/slot/slotService"
import { ServiceCenterRepository } from "../../repository/ServiceCenter/serviceCenterRepository"
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter"
import { SlotRepository } from "../../repository/slot/slotRepository"
const router = express.Router() 

const serviceCenterRepository = new ServiceCenterRepository()
const slotRepository = new SlotRepository()
const slotService = new SlotService(slotRepository,slotRepository,serviceCenterRepository)
const controller = new SlotController(slotService)

router.get("/:serviceCenterId/slots",verifyServiceCenter,controller.getAvailableSlots)
router.post("/block",verifyServiceCenter,controller.blockSlot)
router.post("/unblock",verifyServiceCenter,controller.unBlockSlot)
router.post("/block-day",verifyServiceCenter,controller.blockFullyDay)
router.post("/unblock-day",verifyServiceCenter,controller.unBlockFullDays)

export default router