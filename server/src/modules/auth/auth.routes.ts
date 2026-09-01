import { Router } from "express";
import { validateBody } from "../../shared/middleware/validate-body.js";
import { login, logout, register, requestOtp } from "./auth.controller.js";
import {
  loginSchema,
  registerSchema,
  requestOtpSchema,
} from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/otp", validateBody(requestOtpSchema), requestOtp);
authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/logout", logout);
