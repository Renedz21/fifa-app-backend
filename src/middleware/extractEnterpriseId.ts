import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user.model";

export const extractEnterpriseId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as IUser;
  if (user && user.enterpriseId) {
    req.enterpriseId = user.enterpriseId;
  } else {
    return res.status(400).json({ error: "Enterprise ID not found in user" });
  }
  next();
};
