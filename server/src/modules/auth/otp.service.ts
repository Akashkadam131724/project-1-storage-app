import { randomInt } from "node:crypto";
import {
  OTP_MAX,
  OTP_MIN,
  OTP_PURPOSE_LOGIN,
  OTP_PURPOSE_RESET,
  OTP_PURPOSE_SIGNUP,
  type OtpPurpose,
} from "../../shared/constants/index.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import { OtpModel } from "./otp.model.js";

export async function saveSignupCode(email: string) {
  return saveOtp(email, OTP_PURPOSE_SIGNUP);
}

export async function saveLoginCode(email: string) {
  return saveOtp(email, OTP_PURPOSE_LOGIN);
}

export async function saveResetCode(email: string) {
  return saveOtp(email, OTP_PURPOSE_RESET);
}

export async function consumeSignupCode(email: string, code: string) {
  return consumeOtp(email, code, OTP_PURPOSE_SIGNUP);
}

export async function consumeLoginCode(email: string, code: string) {
  return consumeOtp(email, code, OTP_PURPOSE_LOGIN);
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
