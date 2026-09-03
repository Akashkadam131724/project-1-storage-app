import { config as loadEnv } from "dotenv";
import { z } from "zod";
import {
  DEFAULT_GUEST_STORAGE_BYTES,
  DEFAULT_MAX_STORAGE_BYTES,
  DEFAULT_UPLOAD_DIR,
} from "../shared/constants/index.js";

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
    COOKIE_SECURE: z
      .string()
      .optional()
      .transform((value) => {
        if (value === "true") return "true";
        if (value === "false") return "false";
        return undefined;
      }),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GITHUB_CALLBACK_URL: z
      .string()
      .default("http://127.0.0.1:4000/api/auth/github/callback"),
    UPLOAD_DIR: z.string().min(1).default(DEFAULT_UPLOAD_DIR),
    MAX_STORAGE_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_MAX_STORAGE_BYTES),
    GUEST_STORAGE_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_GUEST_STORAGE_BYTES),
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

export const cookieSecure =
  env.COOKIE_SECURE === "true"
    ? true
    : env.COOKIE_SECURE === "false"
      ? false
      : env.NODE_ENV === "production";
