import type { Request, Response } from "express";
import { clearSessionCookie } from "../auth/session.service.js";
import {
  ApiError,
  ApiResponse,
  ErrorCode,
  HttpStatus,
} from "../../shared/http/index.js";
import {
  assertNotSelf,
  changePassword,
  changeUserRole,
  deleteAccount,
  disableAccount,
  listUsers,
  logoutUserSessions,
  restoreAccount,
  setPassword,
  updateProfile,
} from "./user.service.js";
import type {
  ChangePasswordBody,
  ChangeRoleBody,
  SetPasswordBody,
  UpdateProfileBody,
  UserIdParams,
} from "./user.types.js";

export function getMe(req: Request, res: Response) {
  return ApiResponse.success(res, {
    message: "Profile loaded",
    data: signedIn(req),
  });
}

export async function patchMe(req: Request, res: Response) {
  const { name } = req.body as UpdateProfileBody;
  const profile = await updateProfile(signedIn(req).id, name);
  return ApiResponse.success(res, {
    message: "Profile updated",
    data: profile,
  });
}

export async function patchPassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body as ChangePasswordBody;
  await changePassword(signedIn(req).id, currentPassword, newPassword);
  return ApiResponse.success(res, { message: "Password updated" });
}

export async function postPassword(req: Request, res: Response) {
  const { password } = req.body as SetPasswordBody;
  await setPassword(signedIn(req).id, password);
  return ApiResponse.success(res, { message: "Password set" });
}

export async function disableMe(req: Request, res: Response) {
  await disableAccount(signedIn(req).id);
  clearSessionCookie(res);
  return ApiResponse.success(res, { message: "Account disabled" });
}

export async function deleteMe(req: Request, res: Response) {
  await deleteAccount(signedIn(req).id);
  clearSessionCookie(res);
  return ApiResponse.success(res, { message: "Account deleted" });
}

export async function getUsers(_req: Request, res: Response) {
  const users = await listUsers();
  return ApiResponse.success(res, { message: "Users loaded", data: users });
}

export async function logoutUser(req: Request, res: Response) {
  const { userId } = req.params as UserIdParams;
  assertNotSelf(signedIn(req).id, userId);
  await logoutUserSessions(userId);
  return ApiResponse.success(res, { message: "User signed out" });
}

export async function disableUser(req: Request, res: Response) {
  const { userId } = req.params as UserIdParams;
  assertNotSelf(signedIn(req).id, userId);
  await disableAccount(userId);
  return ApiResponse.success(res, { message: "Account disabled" });
}

export async function restoreUser(req: Request, res: Response) {
  const { userId } = req.params as UserIdParams;
  await restoreAccount(userId);
  return ApiResponse.success(res, { message: "Account restored" });
}

export async function patchRole(req: Request, res: Response) {
  const { userId } = req.params as UserIdParams;
  const { role } = req.body as ChangeRoleBody;
  assertNotSelf(signedIn(req).id, userId);
  const profile = await changeUserRole(userId, role);
  return ApiResponse.success(res, { message: "Role updated", data: profile });
}

export async function removeUser(req: Request, res: Response) {
  const { userId } = req.params as UserIdParams;
  assertNotSelf(signedIn(req).id, userId);
  await deleteAccount(userId);
  return ApiResponse.success(res, { message: "Account deleted" });
}

function signedIn(req: Request) {
  if (!req.user) {
    throw new ApiError({
      code: ErrorCode.UNAUTHENTICATED,
      message: "Sign in required",
      status: HttpStatus.UNAUTHORIZED,
    });
  }
  return req.user;
}
