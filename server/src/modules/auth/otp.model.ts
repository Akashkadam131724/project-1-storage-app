import { Schema, model } from "mongoose";
import { OTP_LENGTH, OTP_TTL_SECONDS } from "../../shared/constants/index.js";

const otpSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  code: {
    type: String,
    required: true,
    minlength: OTP_LENGTH,
    maxlength: OTP_LENGTH,
  },
  createdAt: { type: Date, default: Date.now, expires: OTP_TTL_SECONDS },
});

export const OtpModel = model("Otp", otpSchema);
