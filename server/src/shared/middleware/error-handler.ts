import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: err.issues[0]?.message ?? "Invalid request",
      details: err.issues,
    });
    return;
  }

  logger.error(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: "Something went wrong",
  });
};
