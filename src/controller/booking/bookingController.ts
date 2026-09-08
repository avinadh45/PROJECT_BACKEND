import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { IBookingService } from "../../interface/Booking/IBookingService";
import { sendSuccess } from "../../utils/apiResponse";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";

export class BookingController {
  constructor(private _bookingService: IBookingService) {}

  findAvailableServiceCenter = asyncHandler(
    async (req: Request, res: Response) => {
      const { categoryId, vehicleType, serviceMode, latitude, longitude } =
        req.query;

      const filter = {
        categoryId: categoryId as string,
        vehicleType: vehicleType as string,
        serviceMode: serviceMode as "drive-in" | "pickup-drop",
        latitude: latitude !== undefined ? Number(latitude) : undefined,
        longitude: longitude !== undefined ? Number(longitude) : undefined,
      };
      const result = await this._bookingService.findAvailableGarages(filter);
      return sendSuccess(
        res,
        result,
        MESSAGES.BOOKING.GARAGE_FETCHED,
        HttpStatus.OK,
      );
    },
  );

  createOrder = asyncHandler(async(req:Request,res:Response)=>{

    const userId = (req as any).user.id 
    const result = await this._bookingService.createBookingOrder(userId,req.body)
    sendSuccess(res,result,MESSAGES.BOOKING.BOOKING_CONFIRMED,HttpStatus.OK)
  })

verifyPayment = asyncHandler(async(req:Request,res:Response)=>{

    const userId = (req as any).user.id 
    const result = await this._bookingService.verifyBookingPayment(userId,req.body) 
    sendSuccess(res,result,MESSAGES.BOOKING.BOOKING_CONFIRMED,HttpStatus.OK)
}) 

getBooking = asyncHandler(async(req:Request,res:Response)=>{

  const userId = (req as any).user.id 
  const result = await this._bookingService.getBooking(userId,req.params.bookingId as string) 
  sendSuccess(res,result,MESSAGES.BOOKING.FETCHED,HttpStatus.OK)
})


getServiceCenterBookings = asyncHandler(async(req:Request,res:Response)=>{

  const serviceCenterId = (req as any).serviceCenter.id
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10 
  const status = req.query.status as string | undefined 
  const search = req.query.search as string | undefined 
  const result = await this._bookingService.getServiceCenterBookings(serviceCenterId,page,limit,status,search) 
  sendSuccess(res,result,MESSAGES.BOOKING.FETCHED,HttpStatus.OK)
})

getMechanicBooking = asyncHandler(async(req:Request,res:Response)=>{

  const mechanicId = (req as any).mechanic.id 
  const page = Number(req.query.page) || 1 
  const limit = Number(req.query.limit) || 5 
  const search = req.query.search as string | undefined 
  const status = req.query.status as string | undefined 

  const result = await this._bookingService.getMechanicBooking(mechanicId,page,limit,status,search)
  sendSuccess(res,result,MESSAGES.BOOKING.FETCHED,HttpStatus.OK)
})

getBookingInMechanic = asyncHandler(async(req:Request,res:Response)=>{
  
   const mechanicId = (req as any).mechanic.id
  const { bookingId } = req.params 

  const result = await this._bookingService.getBookingInMechanci(mechanicId,bookingId as string) 
  sendSuccess(res,result,MESSAGES.BOOKING.FETCHED,HttpStatus.OK)
})
updateMechanicJob = asyncHandler(async(req:Request,res:Response)=>{

const mechanicId = (req as any).mechanic.id 
const { bookingId }= req.params
 console.log("booking id in job",bookingId);
 
const { items } = req.body
const result = await this._bookingService.updateMechanicJobItems(mechanicId,bookingId as string, items)
sendSuccess(res,result,MESSAGES.BOOKING.JOBDESCRIPTION_UPDATE,HttpStatus.OK)

})

updateStatus = asyncHandler(async(req:Request,res:Response)=>{

const mechanicId = (req as any).mechanic.id 
const { bookingId }= req.params 
 console.log("booking id in status",bookingId);
const { status } = req.body 
const result = await this._bookingService.updateStatus(bookingId as string,mechanicId,status)
sendSuccess(res,result,MESSAGES.BOOKING.STATUS_UPDATE,HttpStatus.OK)

})

uploadProof = asyncHandler(async(req:Request,res:Response)=>{

  const mechanicId = (req as any).mechanic.id 
const { bookingId }= req.params 

if(!req.file){
  throw new AppError(MESSAGES.BOOKING.PROOF_IMAGE_REQUIRED,HttpStatus.BAD_REQUEST)
}
const image = (req.file as any).path 
const result = await this._bookingService.uploadProof(bookingId as string,mechanicId,image)
sendSuccess(res,result,MESSAGES.BOOKING.PROOF_UPLOADED,HttpStatus.OK)
})

getServiceCenterBookingDetails = asyncHandler(async(req:Request,res:Response)=>{

  const serviceCenterId = (req as any).serviceCenter.id
  const { bookingId } = req.params 
  const result = await this._bookingService.getServiceCenterBookingDetails(bookingId as string,serviceCenterId)
  sendSuccess(res,result,MESSAGES.BOOKING.FETCHED,HttpStatus.OK)
})

getUserBooking = asyncHandler(async(req:Request,res:Response)=>{

  const userId = (req as any).user.id;
  
  const page = Number(req.query.page) || 1 
  const limit = Number(req.query.limit) || 5 
  const status = req.query.status as string | undefined 
  const search = req.query.search as string | undefined
  const result = await this._bookingService.getUserBooking(userId,page,limit,status,search) 
  sendSuccess(res,result,MESSAGES.BOOKING.FETCHED,HttpStatus.OK)
})

getUserBookingDetails = asyncHandler(async(req:Request,res:Response)=>{

  
  const userId  = (req as any).user.id;
  const { bookingId } = req.params 
 // console.log(userId,bookingId,"got them in the controller");
  
  const result = await this._bookingService.getUserBookingDetail(userId,bookingId as string)
  sendSuccess(res,result,MESSAGES.BOOKING.FETCHED,HttpStatus.OK)
})

cancelBooking = asyncHandler(async(req:Request,res:Response)=>{

   const userId  = (req as any).user.id;
  const { bookingId } = req.params 

  const result = await this._bookingService.cancelBooking(userId,bookingId as string)
  sendSuccess(res,result,MESSAGES.BOOKING.CANCELLED,HttpStatus.OK)
})
}
