import User from "../model/Usermodel"
import { Request,Response,NextFunction } from "express"

export const checkBlocked = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    next(); 

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};