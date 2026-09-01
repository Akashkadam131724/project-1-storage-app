import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./shared/lib/logger.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Storage API http://127.0.0.1:${env.PORT}`);
});
