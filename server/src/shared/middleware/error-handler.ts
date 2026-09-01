import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError, ApiResponse, ErrorCode, HttpStatus } from "../http/index.js";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    ApiResponse.fail(res, err);
    return;
  }

  if (err instanceof ZodError) {
    ApiResponse.fail(res, {
      code: ErrorCode.VALIDATION_ERROR,
      message: err.issues[0]?.message ?? "Invalid request",
      status: HttpStatus.BAD_REQUEST,
      details: err.issues,
    });
    return;
  }

  logger.error(err);
  ApiResponse.fail(res, {
    code: ErrorCode.INTERNAL_ERROR,
    message: "Something went wrong",
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  });
};
