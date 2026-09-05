import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { logger } from "../lib/logger.js";

export async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 30_000,
    });
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error(
      "MongoDB connection failed. Atlas cannot reach the primary (TLS timeout). Check Network Access (your IP or 0.0.0.0/0), VPN, or use a local MONGODB_URI.",
    );
    throw error;
  }
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
