import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { IVehicleService } from "../../interface/Vehicle/IVehicleService";
import { HttpStatus } from "../../enums/httpstatus";
import { MESSAGES } from "../../constants/message";
import { CreateVehicleDTO } from "../../dto/vehicle/vehicleDTO";
import { VehicleMapper } from "../../mapper/vehicle/VehicleMapper";
import { sendSuccess } from "../../utils/apiResponse";

export class VehicleController {
  constructor(private _vehicleService: IVehicleService) {}

  addVehicle = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const dto = req.body as CreateVehicleDTO;
    const files = req.files as { [field: string]: Express.Multer.File[] };
    const documents = {
      vehicleImage: files.vehicleImage[0].path,
      RCDocument: files.RCDocument[0].path,
      POCDocument: files.POCDocument[0].path,
    };

    if (
      !files?.vehicleImage?.[0] ||
      !files?.RCDocument?.[0] ||
      !files.POCDocument?.[0]
    ) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.COMMON.VALIDATION_FAILED,
        errors: { files: ["All 3 documents are required"] },
      });
      return;
    }

    const data = VehicleMapper.toDomain(userId, dto, documents);
    const vehicle = await this._vehicleService.addVehicle(data);
    const response = VehicleMapper.toResponseDTO(vehicle);

    return sendSuccess(
      res,
      response,
      MESSAGES.VEHICLE.SUCCESSFULLY_ADDED,
      HttpStatus.CREATED,
    );
  });

  vehicleList = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const vehicle = await this._vehicleService.vehicleList(userId);
    const response = vehicle.map((a) => VehicleMapper.toResponseDTO(a));
    return sendSuccess(
      res,
      response,
      MESSAGES.VEHICLE.VEHICLE_FETCHED,
      HttpStatus.OK,
    );
  });

  updateVehicle = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const id = req.params.id as string 
    const files = req.files as { [files: string]: Express.Multer.File[] };
    const documents = {
      ...(files?.vehicleImage?.[0] && {vehicleImage: files.vehicleImage[0].path,}),
      ...(files?.RCDocument?.[0] && { RCDocument: files.RCDocument[0].path}),
      ...(files?.POCDocument?.[0] && { POCDocument:files.POCDocument[0].path})  
    };
    const updateData = VehicleMapper.toUpdateDomain(req.body,documents)
    const vehicle = await this._vehicleService.updateVehicle(id,userId,updateData)

    return sendSuccess(res,VehicleMapper.toResponseDTO(vehicle!),MESSAGES.VEHICLE.UPDATED_SUCCESSFULLY,HttpStatus.OK)
  });

  getVehicle = asyncHandler(async(req:Request,res:Response)=>{

    const userId = req.user!.id 
    const id = req.params.id as string  

    const vehicle = await this._vehicleService.getVehicle(id,userId) 
    return sendSuccess(res,VehicleMapper.toResponseDTO(vehicle),MESSAGES.VEHICLE.VEHICLE_FETCHED,HttpStatus.OK)
  })

  deleteVehicle = asyncHandler(async(req:Request,res:Response)=>{ 
    const userId = req.user!.id 
    const id = req.params.id as string 
     await this._vehicleService.DeleteVehicle(id,userId) 
    return sendSuccess(res,null,MESSAGES.VEHICLE.VEHICEL_DELETE,HttpStatus.OK)
  })
  
}
