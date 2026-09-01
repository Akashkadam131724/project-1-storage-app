import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../errors/app-error.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(
    new AppError(
      `Cannot ${req.method} ${req.path}`,
      StatusCodes.NOT_FOUND,
      "NOT_FOUND",
    ),
  );
}
