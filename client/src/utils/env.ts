import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().default(""),
  VITE_GOOGLE_CLIENT_ID: z.string().default(""),
});

export const env = envSchema.parse({
  VITE_API_URL: readViteString("VITE_API_URL"),
  VITE_GOOGLE_CLIENT_ID: readViteString("VITE_GOOGLE_CLIENT_ID"),
});

function readViteString(key: "VITE_API_URL" | "VITE_GOOGLE_CLIENT_ID") {
  const value: unknown = import.meta.env[key];
  return typeof value === "string" ? value : "";
}
