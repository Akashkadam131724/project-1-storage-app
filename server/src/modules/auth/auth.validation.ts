import { z } from "zod";
import {
  NAME_MIN_LENGTH,
  OTP_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../../shared/constants/index.js";

const email = z.string().trim().toLowerCase().email("Enter a valid email");
const otpPattern = new RegExp(`^\\d{${String(OTP_LENGTH)}}$`);

export const requestOtpSchema = z.object({
  email,
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
});
