export {}
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: "user" | "serviceCenter" | "mechanic" | "admin"
      }
      serviceCenter?:{
        id:string
        role:"serviceCenter"
      }
    }
  }
}