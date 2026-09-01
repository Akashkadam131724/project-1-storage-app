import { Router } from "express";
import { health } from "./health.controller.js";

export const healthRouter = Router();

healthRouter.get("/", health);
