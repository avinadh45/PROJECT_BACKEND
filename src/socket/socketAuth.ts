import { Socket } from "socket.io";
import { Jwt } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import cookie from "cookie"

export interface AuthenticatedSocket extends Socket {

    userId?:string;
    userRole?: "user" | "serviceCenter" | "mechanic";
}

const COOKIE_BY_ROLE:Record<string,string>={

    user:"accessToken",
    serviceCenter:"scAccessToken",
    mechanic:"mechanicAccessToken",
}

export function socketAuthMiddleware(socket:AuthenticatedSocket,next:(err?: Error)=> void){

    try {
        const rawCookies = socket.handshake.headers.cookie
        if(!rawCookies) return next(new Error("No cookies provided"))

            const cookies = cookie.parse(rawCookies)

         for( const[role,cookieName] of Object.entries(COOKIE_BY_ROLE)){
            const token = cookies[cookieName]
            if(!token)continue 
            try {
              const decoded = jwt.verify(token,process.env.JWT_ACCESS_SECRET as string) as {id:string; role:string};
              socket.userId = decoded.id  
              socket.userRole = role as AuthenticatedSocket["userRole"]
              return next()
            } catch (error) {
                continue
            }
         }   
         return next(new Error("Unauthorized"))
    } catch (error) {
         return next(new Error("Unauthorized"));
    }
}