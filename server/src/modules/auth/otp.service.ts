import { randomInt } from "node:crypto";
import { env } from "../../config/env.js";
import {
  OTP_MAX,
  OTP_MIN,
  OTP_PURPOSE_RESET,
  OTP_PURPOSE_SIGNUP,
  type OtpPurpose,
} from "../../shared/constants/index.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import { logger } from "../../shared/lib/logger.js";
import { OtpModel } from "./otp.model.js";

export async function saveSignupCode(email: string) {
  return saveOtp(email, OTP_PURPOSE_SIGNUP);
}

export async function saveResetCode(email: string) {
  return saveOtp(email, OTP_PURPOSE_RESET);
}

export async function consumeSignupCode(email: string, code: string) {
  return consumeOtp(email, code, OTP_PURPOSE_SIGNUP);
}

export async function consumeResetCode(email: string, code: string) {
  return consumeOtp(email, code, OTP_PURPOSE_RESET);
}

async function saveOtp(email: string, purpose: OtpPurpose) {
  const code = randomInt(OTP_MIN, OTP_MAX).toString();
  await OtpModel.findOneAndUpdate(
    { email },
    { code, purpose, createdAt: new Date() },
    { upsert: true },
  );

  if (env.NODE_ENV !== "production" && env.NODE_ENV !== "test") {
    logger.info(`${purpose} code for ${email}: ${code}`);
  }

  return code;
}

async function consumeOtp(email: string, code: string, purpose: OtpPurpose) {
  const otp = await OtpModel.findOneAndDelete({ email, code, purpose });
  if (!otp) {
    throw new ApiError({
      code: ErrorCode.INVALID_CODE,
      message: "Invalid or expired verification code",
      status: HttpStatus.BAD_REQUEST,
    });
  }
}
