import type { Request, Response, NextFunction } from "express";
import { ApiError, ErrorCode, HttpStatus } from "../http/index.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(
    new ApiError({
      code: ErrorCode.NOT_FOUND,
      message: `Cannot ${req.method} ${req.path}`,
      status: HttpStatus.NOT_FOUND,
    }),
  );
}
