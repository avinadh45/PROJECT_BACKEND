import express from "express"
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import userRouter from "./routes/user/userRouted"
import serviceCenterRouter from "./routes/serviceCenter/serviceCenterRoutes"
import mechanicRouter from "./routes/mechanic/mechanicRoutes"
import adminRouter from "./routes/admin/adminRoute"
import categoryRouter from "./routes/category/categoryRouter"
import { errorMiddleware } from "./middleware/errorMiddleware";

dotenv.config(); 
const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/",userRouter)
app.use("/service-center",serviceCenterRouter)
app.use("/mechanic", mechanicRouter)
app.use("/admin/categorys", categoryRouter) 
app.use("/admin",adminRouter)
app.use(errorMiddleware)

export default app