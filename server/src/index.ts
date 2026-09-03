import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./shared/db/mongoose.js";
import { logger } from "./shared/lib/logger.js";

await connectDb();

const app = createApp();

const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Storage API http://0.0.0.0:${String(env.PORT)}`);
});

async function shutdown() {
  server.close();
  await disconnectDb();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
