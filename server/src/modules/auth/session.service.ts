import type { Response } from "express";
import { cookieSecure } from "../../config/env.js";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from "../../shared/constants/index.js";
import { toPublicUser, UserModel } from "../user/user.model.js";
import { UserSessionModel } from "./userSession.model.js";

const cookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: "lax" as const,
  secure: cookieSecure,
  path: "/",
  maxAge: SESSION_TTL_MS,
};

export async function createUserSession(userId: string) {
  const session = await UserSessionModel.create({ userId });
  return session._id.toString();
}

export async function destroyUserSession(sessionId: string | undefined) {
  if (!sessionId) return;
  await UserSessionModel.findByIdAndDelete(sessionId);
}

export async function destroyAllUserSessions(userId: string) {
  await UserSessionModel.deleteMany({ userId });
}

export async function getUserFromSession(sessionId: string) {
  const session = await UserSessionModel.findById(sessionId);
  if (!session) return null;

  const user = await UserModel.findById(session.userId).select("+passwordHash");
  if (!user || user.isDeleted) return null;

  return toPublicUser(user);
}

export function attachSessionCookie(res: Response, sessionId: string) {
  res.cookie(SESSION_COOKIE_NAME, sessionId, cookieOptions);
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
}

export function readSessionId(signedCookies: Record<string, unknown>) {
  const value = signedCookies[SESSION_COOKIE_NAME];
  return typeof value === "string" ? value : undefined;
}
