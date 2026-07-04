export interface IBaseRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findOne(filter: Record<string, any>): Promise<T | null>;
    updateById(id: string, updateData: Partial<T>): Promise<T | null>;
}
