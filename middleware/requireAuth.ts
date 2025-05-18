import { Request, Response, NextFunction } from "express";

export const requireAuth = (req: any, res: any, next: NextFunction) => {
  if (!req.session?.id) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }
  next();
};
