import { Request, Response, NextFunction } from "express";

export const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  // Asigna los valores de paginación al objeto de consulta
  req.query.page = page.toString();
  req.query.limit = limit.toString();

  next();
};
