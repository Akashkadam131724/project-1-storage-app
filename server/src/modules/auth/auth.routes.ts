import { Router } from "express";
import { validateBody } from "../../shared/middleware/validate-body.js";
import {
  forgotPassword,
  githubCallback,
  githubLogin,
  githubStart,
  googleLogin,
  guestLogin,
  login,
  logout,
  logoutAll,
  register,
  requestOtp,
  resetPasswordHandler,
} from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";
import {
  forgotPasswordSchema,
  githubLoginSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/otp", validateBody(requestOtpSchema), requestOtp);
authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/guest", guestLogin);
authRouter.post("/google", validateBody(googleLoginSchema), googleLogin);
authRouter.get("/github/start", githubStart);
authRouter.get("/github/callback", githubCallback);
authRouter.post("/github", validateBody(githubLoginSchema), githubLogin);
authRouter.post(
  "/password/forgot",
  validateBody(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post(
  "/password/reset",
  validateBody(resetPasswordSchema),
  resetPasswordHandler,
);
authRouter.post("/logout", logout);
authRouter.post("/logout-all", requireAuth, logoutAll);
