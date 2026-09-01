import type { ErrorCode } from "./errorCodes.js";
import type { HttpStatus } from "./httpStatus.js";

type ApiErrorInit = {
  code: ErrorCode;
  message: string;
  status: HttpStatus;
  details?: unknown;
};

export class ApiError extends Error {
  readonly statusCode: HttpStatus;
  readonly code: ErrorCode;
  readonly details?: unknown;
  readonly isOperational = true;

  constructor({ code, message, status, details }: ApiErrorInit) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = status;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      success: false as const,
      code: this.code,
      message: this.message,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}
