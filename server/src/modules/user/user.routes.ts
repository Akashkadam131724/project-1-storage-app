import { Router } from "express";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middleware/validate-body.js";
import { validateParams } from "../../shared/middleware/validate-params.js";
import { validateQuery } from "../../shared/middleware/validate-query.js";
import { paginationQuerySchema } from "../../shared/pagination/index.js";
import {
  deleteMe,
  disableMe,
  disableUser,
  getMe,
  getUsers,
  logoutUser,
  patchMe,
  patchPassword,
  patchRole,
  postPassword,
  removeUser,
  restoreUser,
} from "./user.controller.js";
import {
  changePasswordSchema,
  changeRoleSchema,
  setPasswordSchema,
  updateProfileSchema,
  userIdParamsSchema,
} from "./user.validation.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/me", getMe);
userRouter.patch("/me", validateBody(updateProfileSchema), patchMe);
userRouter.patch(
  "/me/password",
  validateBody(changePasswordSchema),
  patchPassword,
);
userRouter.post("/me/password", validateBody(setPasswordSchema), postPassword);
userRouter.patch("/me/disable", disableMe);
userRouter.delete("/me", deleteMe);

userRouter.get(
  "/",
  requireAdmin,
  validateQuery(paginationQuerySchema),
  getUsers,
);
userRouter.post(
  "/:userId/logout",
  requireAdmin,
  validateParams(userIdParamsSchema),
  logoutUser,
);
userRouter.patch(
  "/:userId/disable",
  requireAdmin,
  validateParams(userIdParamsSchema),
  disableUser,
);
userRouter.patch(
  "/:userId/restore",
  requireAdmin,
  validateParams(userIdParamsSchema),
  restoreUser,
);
userRouter.patch(
  "/:userId/role",
  requireAdmin,
  validateParams(userIdParamsSchema),
  validateBody(changeRoleSchema),
  patchRole,
);
userRouter.delete(
  "/:userId",
  requireAdmin,
  validateParams(userIdParamsSchema),
  removeUser,
);
