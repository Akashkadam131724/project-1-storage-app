import { config as loadEnv } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "test") {
  loadEnv();
}

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
    MONGODB_URI: z.string().default("mongodb://127.0.0.1:27017/storage-app-v2"),
    COOKIE_SECRET: z.string().min(16).default("dev-only-cookie-secret-change"),
  })
  .superRefine((value, ctx) => {
    if (
      value.NODE_ENV === "production" &&
      value.COOKIE_SECRET.startsWith("dev-only")
    ) {
      ctx.addIssue({
        code: "custom",
        message: "COOKIE_SECRET must be set in production",
        path: ["COOKIE_SECRET"],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${details}`);
}

export const env = parsed.data;
export type Env = typeof env;
