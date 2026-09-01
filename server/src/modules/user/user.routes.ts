import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { getMe } from "./user.controller.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, getMe);
