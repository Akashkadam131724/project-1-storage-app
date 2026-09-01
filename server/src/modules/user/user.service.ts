import { hashPassword, verifyPassword } from "../auth/auth.service.js";
import { destroyAllUserSessions } from "../auth/session.service.js";
import { DirectoryModel } from "../directory/directory.model.js";
import { deleteAllUserFiles } from "../file/file.service.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import { toPublicUser, UserModel } from "./user.model.js";
import type { UserRole } from "../../shared/constants/index.js";

export async function updateProfile(userId: string, name: string) {
  const user = await loadUser(userId);
  user.name = name;
  await user.save();
  return toPublicUser(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await loadUser(userId);
  if (!user.passwordHash) {
    throw new ApiError({
      code: ErrorCode.INVALID_CREDENTIALS,
      message: "Set a password before changing it",
      status: HttpStatus.UNAUTHORIZED,
    });
  }
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new ApiError({
      code: ErrorCode.INVALID_CREDENTIALS,
      message: "Current password is incorrect",
      status: HttpStatus.UNAUTHORIZED,
    });
  }
  if (currentPassword === newPassword) {
    throw new ApiError({
      code: ErrorCode.SAME_PASSWORD,
      message: "New password must be different",
      status: HttpStatus.CONFLICT,
    });
  }
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
}

export async function setPassword(userId: string, password: string) {
  const user = await loadUser(userId);
  if (user.passwordHash) {
    throw new ApiError({
      code: ErrorCode.PASSWORD_ALREADY_SET,
      message: "A password is already set. Use change password instead",
      status: HttpStatus.CONFLICT,
    });
  }
  user.passwordHash = await hashPassword(password);
  await user.save();
}

export async function disableAccount(userId: string) {
  const user = await loadUser(userId);
  if (user.isDeleted) {
    throw new ApiError({
      code: ErrorCode.ACCOUNT_DISABLED,
      message: "This account is already disabled",
      status: HttpStatus.CONFLICT,
    });
  }
  user.isDeleted = true;
  await user.save();
  await destroyAllUserSessions(userId);
}

export async function restoreAccount(userId: string) {
  const user = await loadUser(userId);
  user.isDeleted = false;
  await user.save();
}

export async function deleteAccount(userId: string) {
  await loadUser(userId);
  await destroyAllUserSessions(userId);
  await deleteAllUserFiles(userId);
  await DirectoryModel.deleteMany({ userId });
  await UserModel.deleteOne({ _id: userId });
}

export async function listUsers() {
  const users = await UserModel.find().select("+passwordHash");
  return users.map((user) => ({
    ...toPublicUser(user),
    isDeleted: user.isDeleted,
  }));
}

export async function changeUserRole(userId: string, role: UserRole) {
  const user = await loadUser(userId);
  user.role = role;
  await user.save();
  return toPublicUser(user);
}

export async function logoutUserSessions(userId: string) {
  await loadUser(userId);
  await destroyAllUserSessions(userId);
}

export function assertNotSelf(actorId: string, targetId: string) {
  if (actorId === targetId) {
    throw new ApiError({
      code: ErrorCode.FORBIDDEN,
      message: "You cannot perform this action on your own account",
      status: HttpStatus.FORBIDDEN,
    });
  }
}

async function loadUser(userId: string) {
  const user = await UserModel.findById(userId).select("+passwordHash");
  if (!user) {
    throw new ApiError({
      code: ErrorCode.NOT_FOUND,
      message: "User not found",
      status: HttpStatus.NOT_FOUND,
    });
  }
  return user;
}
