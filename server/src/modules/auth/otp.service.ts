import { randomInt } from "node:crypto";
import { env } from "../../config/env.js";
import { OTP_MAX, OTP_MIN } from "../../shared/constants/index.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import { logger } from "../../shared/lib/logger.js";
import { OtpModel } from "./otp.model.js";

export async function saveSignupCode(email: string) {
  const code = randomInt(OTP_MIN, OTP_MAX).toString();
  await OtpModel.findOneAndUpdate(
    { email },
    { code, createdAt: new Date() },
    { upsert: true },
  );

  if (env.NODE_ENV !== "production" && env.NODE_ENV !== "test") {
    logger.info(`Signup code for ${email}: ${code}`);
  }

  return code;
}

export async function consumeSignupCode(email: string, code: string) {
  const otp = await OtpModel.findOneAndDelete({ email, code });
  if (!otp) {
    throw new ApiError({
      code: ErrorCode.INVALID_CODE,
      message: "Invalid or expired verification code",
      status: HttpStatus.BAD_REQUEST,
    });
  }
}
