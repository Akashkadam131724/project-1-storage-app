import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { logger } from "../lib/logger.js";

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  logger.info("MongoDB connected");
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
