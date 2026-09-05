import { z } from "zod";
import {
  NAME_MIN_LENGTH,
  OTP_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../../shared/constants/index.js";

const email = z.string().trim().toLowerCase().email("Enter a valid email");
const otpPattern = new RegExp(`^\\d{${String(OTP_LENGTH)}}$`);

export const requestOtpSchema = z
  .object({
    email,
    action: z.enum(["login", "register"]),
    password: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === "login" && !value.password) {
      ctx.addIssue({
        code: "custom",
        message: "Password is required",
        path: ["password"],
      });
    }
  });

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      NAME_MIN_LENGTH,
      `Name must be at least ${String(NAME_MIN_LENGTH)} characters`,
    ),
  email,
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${String(PASSWORD_MIN_LENGTH)} characters`,
    ),
  code: z
    .string()
    .length(OTP_LENGTH, `Code must be ${String(OTP_LENGTH)} digits`)
    .regex(otpPattern, `Code must be ${String(OTP_LENGTH)} digits`),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
  code: z
    .string()
    .length(OTP_LENGTH, `Code must be ${String(OTP_LENGTH)} digits`)
    .regex(otpPattern, `Code must be ${String(OTP_LENGTH)} digits`),
});

export const googleLoginSchema = z.object({
  code: z.string().min(1, "Google authorization code is required"),
});

export const githubLoginSchema = z.object({
  code: z.string().min(1, "GitHub authorization code is required"),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  email,
  code: z
    .string()
    .length(OTP_LENGTH, `Code must be ${String(OTP_LENGTH)} digits`)
    .regex(otpPattern, `Code must be ${String(OTP_LENGTH)} digits`),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Password must be at least ${String(PASSWORD_MIN_LENGTH)} characters`,
    ),
});
