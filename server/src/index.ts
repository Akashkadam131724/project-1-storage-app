import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./shared/db/mongoose.js";
import { logger } from "./shared/lib/logger.js";

await connectDb();

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Storage API http://127.0.0.1:${env.PORT}`);
});

async function shutdown() {
  server.close();
  await disconnectDb();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});
