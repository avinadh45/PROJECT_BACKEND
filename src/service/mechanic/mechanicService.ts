import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import { IMechanicService } from "../../interface/Machanic/IMechanicservice";
import { IMechanicWriteRepository } from "../../interface/Machanic/IMechanicWriteRepository";
import { IMechanicReadRepository } from "../../interface/Machanic/IMechanicReadRepository";
import { CreateMechanicDTO } from "../../dto/mechanic/createMechanicdto";
import { MachanicMapper } from "../../mapper/mechanic/mechanicMapper";
import { MechanicLoginDTO } from "../../dto/mechanic/mechanicLoginDTO";
import { MechanicAuthResponseDTO } from "../../dto/mechanic/mechanicAuthDTO";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../enums/httpstatus";
import { MESSAGES } from "../../constants/message";
import { MechanicResponseDTO } from "../../dto/mechanic/mechanicResponsedto";
import { CreateMechanicSchema } from "../../validation/mechanicValidation";
export class MechanicService implements IMechanicService {
  constructor(
    private _readRepository: IMechanicReadRepository,
    private _writeRepository: IMechanicWriteRepository,
  ) {}

  async createMechanic(data: CreateMechanicDTO) {
    const parsed = CreateMechanicSchema.safeParse(data)

    if(!parsed.success){
      const message =parsed.error.issues[0].message;
      throw  new AppError(message,HttpStatus.BAD_REQUEST)
    }

    const { name,email,password} = parsed.data

    const existing = await this._readRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError(MESSAGES.MECHANIC.ALREADY_EXISTS,HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const entity = MachanicMapper.toEntity({
      name,
      email,
      password: hashedPassword,
    });
    const newMechanic = await this._writeRepository.create(entity);
    return MachanicMapper.toResponse(newMechanic);
  }

  async login(data: MechanicLoginDTO): Promise<MechanicAuthResponseDTO> {
    const mechanic = await this._readRepository.findByEmail(data.email);

    if (!mechanic) {
      throw new AppError(MESSAGES.MECHANIC.NOT_FOUND,HttpStatus.NOT_FOUND);
    }

    if (mechanic.isBlocked) {
      throw new AppError(MESSAGES.COMMON.ACCOUNT_BLOCKED,HttpStatus.FORBIDDEN);
    }

    const isMatch = await bcrypt.compare(
      data.password,
      mechanic.password as string,
    );

    if (!isMatch) {
      throw new AppError(MESSAGES.MECHANIC.INVALID,HttpStatus.UNAUTHORIZED);
    }

    const accessToken = generateAccessToken({
      id: mechanic._id.toString(),
      role: "mechanic",
    });

    const refreshToken = generateRefreshToken({
      id: mechanic._id.toString(),
      role: "mechanic",
    });
    return {
      mechanic: MachanicMapper.toResponse(mechanic),
      accessToken,
      refreshToken,
    };
  }

  async getMechanics(garageId: string, page: number, limit: number,search:string="") {
    const mechanic = await this._readRepository.findByGarage(
      garageId,
      page,
      limit,
      search
    );
    return {
      data: mechanic.data.map(MachanicMapper.toResponse),
      total: mechanic.total,
      page: mechanic.page,
      limit: mechanic.limit,
      totalPages: mechanic.totalPages,
    };
  }

  async block(id: string): Promise<MechanicResponseDTO> {
    const mechanic = await this._readRepository.findById(id);
    if (!mechanic) {
      throw new AppError(MESSAGES.MECHANIC.NOT_FOUND,HttpStatus.NOT_FOUND);
    }
    const data = await this._writeRepository.update(id, {
      isBlocked: !mechanic.isBlocked,
    });
    if (!data) {
      throw new AppError(MESSAGES.COMMON.INTERNAL_ERROR,HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return MachanicMapper.toResponse(data);
  }
  // async getMechanics(serviceCenterId:string){
  //     const mechanic = await this.readRepository.findByGarage(serviceCenterId)
  //     return mechanic.map(MapMechanicToDTO)
  // }
}
