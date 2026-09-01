import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validateQuery } from "../../shared/middleware/validate-query.js";
import { paginationQuerySchema } from "../../shared/pagination/index.js";
import { getRecent, getStarred, getTrash } from "./library.controller.js";

export const trashRouter = Router();
trashRouter.use(requireAuth);
trashRouter.get("/", validateQuery(paginationQuerySchema), getTrash);

export const starredRouter = Router();
starredRouter.use(requireAuth);
starredRouter.get("/", validateQuery(paginationQuerySchema), getStarred);

export const recentRouter = Router();
recentRouter.use(requireAuth);
recentRouter.get("/", validateQuery(paginationQuerySchema), getRecent);
