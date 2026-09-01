import type { Request, Response } from "express";
import { ApiResponse, HttpStatus } from "../../shared/http/index.js";
import { requestSignupCode, registerAccount, signIn } from "./auth.service.js";
import type { LoginBody, RegisterBody, RequestOtpBody } from "./auth.types.js";
import {
  attachSessionCookie,
  clearSessionCookie,
  destroyUserSession,
  readSessionId,
} from "./session.service.js";

export async function requestOtp(req: Request, res: Response) {
  const { email } = req.body as RequestOtpBody;
  const data = await requestSignupCode(email);
  return ApiResponse.success(res, {
    message: "Verification code sent",
    data,
  });
}

export async function register(req: Request, res: Response) {
  const body = req.body as RegisterBody;
  await registerAccount(body);
  return ApiResponse.success(res, {
    message: "Account created",
    status: HttpStatus.CREATED,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginBody;
  const { sessionId, profile } = await signIn(email, password);
  attachSessionCookie(res, sessionId);
  return ApiResponse.success(res, { message: "Signed in", data: profile });
}

export async function logout(req: Request, res: Response) {
  const sessionId = readSessionId(req.signedCookies);
  await destroyUserSession(sessionId);
  clearSessionCookie(res);
  return ApiResponse.success(res, { message: "Signed out" });
}
