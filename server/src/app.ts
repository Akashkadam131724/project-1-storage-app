import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/index.js";
import { directoryRouter } from "./modules/directory/index.js";
import { fileRouter } from "./modules/file/index.js";
import { healthRouter } from "./modules/health/index.js";
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
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser(env.COOKIE_SECRET));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/directories", directoryRouter);
  app.use("/api/files", fileRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
