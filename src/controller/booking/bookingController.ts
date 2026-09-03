import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { IBookingService } from "../../interface/Booking/IBookingService";
import { sendSuccess } from "../../utils/apiResponse";
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
}
