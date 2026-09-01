import type { ErrorRequestHandler } from "express";
import { MulterError } from "multer";
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

  if (err instanceof MulterError) {
    const tooLarge = err.code === "LIMIT_FILE_SIZE";
    ApiResponse.fail(res, {
      code: tooLarge ? ErrorCode.PAYLOAD_TOO_LARGE : ErrorCode.VALIDATION_ERROR,
      message: tooLarge ? "File is too large" : err.message,
      status: tooLarge ? HttpStatus.PAYLOAD_TOO_LARGE : HttpStatus.BAD_REQUEST,
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
