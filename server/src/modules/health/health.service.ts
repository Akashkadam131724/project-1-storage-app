import { APP_NAME } from "../../shared/constants/index.js";

export function getHealth() {
  return {
    ok: true as const,
    service: APP_NAME,
    env: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  };
}
