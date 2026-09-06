import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db";
import app from "./app";
import { connectRedis } from "./config/redis";

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error("Server startup failed:", error);
  }

};
startServer();
