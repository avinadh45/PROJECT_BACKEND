
import { Model } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
export class BaseRepository<T> implements IBaseRepository<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data);
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findOne(filter: Record<string, any>): Promise<T | null> {
        return await this.model.findOne(filter);
    }

    async updateById(id: string, updateData: Partial<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, updateData, { returnDocument: "after"  });
    }
    async paination(filter:Record<string,any>,page:number = 1 , limit:number = 5){
        const skip = (page - 1) * limit ;
        const data = await this.model.find(filter).skip(skip).limit(limit).sort({ CreatedAt: -1})
        const total = await this.model.countDocuments(filter)
        return {data,total,page,limit,totalpages:Math.ceil(total/limit)}
    }

}
