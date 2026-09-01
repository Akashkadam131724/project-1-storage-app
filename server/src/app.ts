import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { JSON_BODY_LIMIT } from "./shared/constants/index.js";
import { authRouter } from "./modules/auth/index.js";
import { directoryRouter } from "./modules/directory/index.js";
import { fileRouter } from "./modules/file/index.js";
import { healthRouter } from "./modules/health/index.js";
import {
  recentRouter,
  starredRouter,
  trashRouter,
} from "./modules/library/index.js";
import { userRouter } from "./modules/user/index.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { notFound } from "./shared/middleware/not-found.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(cookieParser(env.COOKIE_SECRET));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/directories", directoryRouter);
  app.use("/api/files", fileRouter);
  app.use("/api/trash", trashRouter);
  app.use("/api/starred", starredRouter);
  app.use("/api/recent", recentRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
