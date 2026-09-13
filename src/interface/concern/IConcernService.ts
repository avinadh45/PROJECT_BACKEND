import { CreateConcernDTO,ConcernSummaryDTO, ConcernDetailDTO, RespondToConcernDTO,ConcernListSummaryDTO } from "../../dto/concern/concernDTO";

import { PaginatedResponse } from "../common/pagination";

export interface IConcernService{

    createConcern(userId:string,data:CreateConcernDTO,proof?:{imageUrl?:string,videoUrl?:string}):Promise<ConcernSummaryDTO>
  getServiceCenterConcerns(serviceCenterId: string, page: number, limit: number, status?: string): Promise<PaginatedResponse<ConcernListSummaryDTO>>;
    getConcernDetails(serviceCenterId:string,concernId:string):Promise<ConcernDetailDTO>
    responceClient(servicCenterId:string,concernId:string,dto:RespondToConcernDTO):Promise<ConcernDetailDTO>

}