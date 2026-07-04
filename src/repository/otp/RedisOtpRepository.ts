import { redisClient } from "../../config/redis";
import { IOtpRepository } from "./IOtpRepository";

export class RedisOtpRepository implements IOtpRepository {
    async saveOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
        await redisClient.set(`otp:${email}`, otp, { EX: ttlSeconds });
    }

    async getOtp(email: string): Promise<string | null> {
        return await redisClient.get(`otp:${email}`);
    }

    async deleteOtp(email: string): Promise<void> {
        await redisClient.del(`otp:${email}`);
    }
    
}
