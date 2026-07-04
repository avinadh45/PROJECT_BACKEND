import { Request,Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { IVehicleService } from "../../interface/Vehicle/IVehicleService";
import { HttpStatus } from "../../enums/httpstatus";
import { MESSAGES } from "../../constants/message";
