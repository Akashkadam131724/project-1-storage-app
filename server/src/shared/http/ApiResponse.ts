import type { Response } from "express";
import { ApiError } from "./ApiError.js";
import type { ErrorCode } from "./errorCodes.js";
import { HttpStatus } from "./httpStatus.js";

export type SuccessBody<T> = {
  success: true;
  message: string;
  data?: T;
};

export type ErrorBody = {
  success: false;
  code: ErrorCode;
  message: string;
  details?: unknown;
};

type SuccessOptions<T> = {
  message: string;
  data?: T;
  status?: HttpStatus;
};

type FailOptions = {
  code: ErrorCode;
  message: string;
  status: HttpStatus;
  details?: unknown;
};

export class ApiResponse {
  static success<T>(
    res: Response,
    { message, data, status }: SuccessOptions<T>,
  ) {
    const body: SuccessBody<T> = { success: true, message };
    if (data !== undefined) {
      body.data = data;
    }
    return res.status(status ?? HttpStatus.OK).json(body);
  }

  static fail(res: Response, error: ApiError | FailOptions) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(error.toJSON());
    }

    const body: ErrorBody = {
      success: false,
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    };
    return res.status(error.status).json(body);
  }
}
