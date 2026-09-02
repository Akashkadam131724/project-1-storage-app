import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validateQuery } from "../../shared/middleware/validate-query.js";
import { listingQuerySchema } from "../../shared/listing/index.js";
import { getRecent, getStarred, getTrash } from "./library.controller.js";

export const trashRouter = Router();
trashRouter.use(requireAuth);
trashRouter.get("/", validateQuery(listingQuerySchema), getTrash);

export const starredRouter = Router();
starredRouter.use(requireAuth);
starredRouter.get("/", validateQuery(listingQuerySchema), getStarred);

export const recentRouter = Router();
recentRouter.use(requireAuth);
recentRouter.get("/", validateQuery(listingQuerySchema), getRecent);
