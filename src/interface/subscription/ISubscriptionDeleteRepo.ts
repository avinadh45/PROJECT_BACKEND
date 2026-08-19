
export interface ISubscriptionDeleteRepository{

    delete(id:string):Promise<boolean>
}