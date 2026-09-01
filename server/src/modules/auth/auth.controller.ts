import type { Request, Response } from "express";
import {
  ApiError,
  ApiResponse,
  ErrorCode,
  HttpStatus,
} from "../../shared/http/index.js";
import {
  registerAccount,
  requestPasswordReset,
  requestSignupCode,
  resetPassword,
  signIn,
  signInWithGithub,
  signInWithGoogle,
} from "./auth.service.js";
import type {
  ForgotPasswordBody,
  GithubLoginBody,
  GoogleLoginBody,
  LoginBody,
  RegisterBody,
  RequestOtpBody,
  ResetPasswordBody,
} from "./auth.types.js";
import {
  attachGithubStateCookie,
  clearGithubStateCookie,
  clientAuthRedirect,
  githubAuthorizeUrl,
  newOauthState,
  readGithubState,
} from "./oauth.service.js";
import {
  attachSessionCookie,
  clearSessionCookie,
  destroyAllUserSessions,
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

export async function googleLogin(req: Request, res: Response) {
  const { idToken } = req.body as GoogleLoginBody;
  const { sessionId, profile } = await signInWithGoogle(idToken);
  attachSessionCookie(res, sessionId);
  return ApiResponse.success(res, { message: "Signed in", data: profile });
}

export function githubStart(_req: Request, res: Response) {
  const state = newOauthState();
  const url = githubAuthorizeUrl(state);
  attachGithubStateCookie(res, state);
  return ApiResponse.success(res, {
    message: "Continue at GitHub",
    data: { url },
  });
}

export async function githubCallback(req: Request, res: Response) {
  const redirectTo = await completeGithubCallback(req, res);
  return res.redirect(redirectTo);
}

export async function githubLogin(req: Request, res: Response) {
  const { code } = req.body as GithubLoginBody;
  const { sessionId, profile } = await signInWithGithub(code);
  attachSessionCookie(res, sessionId);
  return ApiResponse.success(res, { message: "Signed in", data: profile });
}

export async function logout(req: Request, res: Response) {
  const sessionId = readSessionId(req.signedCookies);
  await destroyUserSession(sessionId);
  clearSessionCookie(res);
  return ApiResponse.success(res, { message: "Signed out" });
}

export async function logoutAll(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError({
      code: ErrorCode.UNAUTHENTICATED,
      message: "Sign in required",
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  await destroyAllUserSessions(req.user.id);
  clearSessionCookie(res);
  return ApiResponse.success(res, { message: "Signed out everywhere" });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as ForgotPasswordBody;
  const data = await requestPasswordReset(email);
  return ApiResponse.success(res, {
    message: "If that email exists, a reset code was sent",
    data,
  });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const { email, code, password } = req.body as ResetPasswordBody;
  await resetPassword(email, code, password);
  return ApiResponse.success(res, { message: "Password updated" });
}

async function completeGithubCallback(req: Request, res: Response) {
  const code = queryValue(req.query.code);
  const state = queryValue(req.query.state);
  const oauthError = queryValue(req.query.error);
  const expected = readGithubState(req.signedCookies);
  clearGithubStateCookie(res);

  if (oauthError || !code || !state || !expected || expected !== state) {
    return clientAuthRedirect("error");
  }

  try {
    const { sessionId } = await signInWithGithub(code);
    attachSessionCookie(res, sessionId);
    return clientAuthRedirect("ok");
  } catch (error) {
    if (error instanceof ApiError) {
      return clientAuthRedirect("error");
    }
    throw error;
  }
}

function queryValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
