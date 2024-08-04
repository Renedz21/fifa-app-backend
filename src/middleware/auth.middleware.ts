import { Response, NextFunction } from "express";
import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { envs } from "../constants/environment";

import jwt from "jsonwebtoken";
import { UserModel } from "../models";

const authorize = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

export const verifyToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers?.authorization?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(HTTP_RESPONSE_CODE.UNAUTHORIZED)
      .json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, envs.JWT_KEY) as any;
    const user = await UserModel.findById({ _id: decoded.userId }).populate(
      "enterpriseId"
    );

    if (!user) {
      return res
        .status(HTTP_RESPONSE_CODE.UNAUTHORIZED)
        .json({ message: "Token is not valid" });
    }

    req.user = decoded;

    next();
  } catch (error) {
    res
      .status(HTTP_RESPONSE_CODE.UNAUTHORIZED)
      .json({ message: "Token is not valid" });
  }
};

export default {
  authorize,
  verifyToken,
};
