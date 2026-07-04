export interface IMechanic {
  _id: string
  name:string
  email: string
  password?: string
  role: "mechanic"
  garageId: string
  isBlocked: boolean
}