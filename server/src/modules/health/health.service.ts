export function getHealth() {
  return {
    ok: true as const,
    service: "storage-app-v2",
    env: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  };
}
