import type { z } from "zod";
import type {
  changePasswordSchema,
  changeRoleSchema,
  setPasswordSchema,
  updateProfileSchema,
  userIdParamsSchema,
} from "./user.validation.js";

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
export type SetPasswordBody = z.infer<typeof setPasswordSchema>;
export type ChangeRoleBody = z.infer<typeof changeRoleSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
