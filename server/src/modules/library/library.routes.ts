import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { getRecent, getStarred, getTrash } from "./library.controller.js";

export const trashRouter = Router();
trashRouter.use(requireAuth);
trashRouter.get("/", getTrash);

export const starredRouter = Router();
starredRouter.use(requireAuth);
starredRouter.get("/", getStarred);

export const recentRouter = Router();
recentRouter.use(requireAuth);
recentRouter.get("/", getRecent);
