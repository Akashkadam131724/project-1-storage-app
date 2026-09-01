import { z } from "zod";
import {
  NAME_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
  USER_ROLES,
} from "../../shared/constants/index.js";

const password = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${String(PASSWORD_MIN_LENGTH)} characters`,
  );

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      NAME_MIN_LENGTH,
      `Name must be at least ${String(NAME_MIN_LENGTH)} characters`,
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: password,
});

export const setPasswordSchema = z.object({
  password,
});

export const changeRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export const userIdParamsSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user id"),
});
