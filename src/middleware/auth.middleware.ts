import { Response, NextFunction, Request } from "express";
import { HTTP_RESPONSE_CODE } from "../constants/appHttpCode";
import { envs } from "../constants/environment";

import jwt from "jsonwebtoken";
import { UserModel } from "../models";

export const authorize = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Usted no tiene permisos para realizar esta acción.",
      });
    }
    next();
  };
};

// Middleware para verificar si el usuario tiene permisos para acceder a una ruta
export const conditionalAuthorize = (
  allowedRoles: string[],
  routes: string[]
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const openRoutes = routes.map((route) => route.toLowerCase());
    console.log({ openRoutes });
    console.log({ reqPath: req.path.toLowerCase() });
    if (openRoutes.includes(req.path.toLowerCase())) {
      return next(); // Omitir autorización para rutas abiertas
    }

    return authorize(allowedRoles)(req, res, next);
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
