import type { Request, Response } from "express";
import {
  ApiError,
  ApiResponse,
  ErrorCode,
  HttpStatus,
} from "../../shared/http/index.js";

export function getMe(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError({
      code: ErrorCode.UNAUTHENTICATED,
      message: "Sign in required",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  return ApiResponse.success(res, { message: "ok", data: req.user });
}
