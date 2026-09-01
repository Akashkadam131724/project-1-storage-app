import type { NextFunction, Request, Response } from "express";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import {
  clearSessionCookie,
  getUserFromSession,
  readSessionId,
} from "./session.service.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionId = readSessionId(req.signedCookies);
  if (!sessionId) {
    clearSessionCookie(res);
    throw new ApiError({
      code: ErrorCode.UNAUTHENTICATED,
      message: "Sign in required",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  const user = await getUserFromSession(sessionId);
  if (!user) {
    clearSessionCookie(res);
    throw new ApiError({
      code: ErrorCode.UNAUTHENTICATED,
      message: "Sign in required",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  req.user = user;
  next();
}
