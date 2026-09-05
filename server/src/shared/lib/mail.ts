import { Resend } from "resend";
import { env, otpEchoCode } from "../../config/env.js";
import {
  OTP_PURPOSE_LOGIN,
  OTP_PURPOSE_RESET,
  OTP_TTL_SECONDS,
  type OtpPurpose,
} from "../constants/index.js";
import { ApiError, ErrorCode, HttpStatus } from "../http/index.js";
import { logger } from "./logger.js";

const MAIL_APP_NAME = "Storage";
const OTP_TTL_MINUTES = Math.round(OTP_TTL_SECONDS / 60);

let resendClient: Resend | null = null;

export function isMailConfigured(
  config: { RESEND_KEY?: string; RESEND_FROM?: string } = env,
) {
  return Boolean(config.RESEND_KEY && config.RESEND_FROM);
}

export async function deliverOtpCode(
  email: string,
  code: string,
  purpose: OtpPurpose,
  options: { required?: boolean } = {},
): Promise<{ code?: string }> {
  const echo = otpEchoCode;
  const required = options.required ?? true;

  if (isMailConfigured()) {
    await sendOtpMail(email, code, purpose);
    return echo ? { code } : {};
  }

  if (echo) {
    logger.info(`${purpose} code for ${email}: ${code}`);
    return { code };
  }

  if (!required) {
    logger.warn(`OTP email skipped for ${email}: Resend is not configured`);
    return {};
  }

  throw new ApiError({
    code: ErrorCode.MAIL_NOT_CONFIGURED,
    message: "Email delivery is not configured",
    status: HttpStatus.SERVICE_UNAVAILABLE,
  });
}

async function sendOtpMail(email: string, code: string, purpose: OtpPurpose) {
  const copy = mailCopy(purpose);
  const from = env.RESEND_FROM;
  const key = env.RESEND_KEY;
  if (!from || !key) {
    throw new ApiError({
      code: ErrorCode.MAIL_NOT_CONFIGURED,
      message: "Email delivery is not configured",
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
  }

  try {
    const { error } = await client(key).emails.send({
      from,
      to: [email],
      subject: copy.subject,
      html: otpTemplate(code, copy.intro),
      text: [
        copy.intro,
        "",
        `Your code is ${code}.`,
        `It expires in ${OTP_TTL_MINUTES} minutes.`,
        "",
        "If you did not request this, you can ignore this email.",
      ].join("\n"),
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    logger.error("Failed to send OTP email", error);
    throw new ApiError({
      code: ErrorCode.MAIL_FAILED,
      message: "Could not send the verification email",
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
  }
}

function mailCopy(purpose: OtpPurpose) {
  if (purpose === OTP_PURPOSE_RESET) {
    return {
      subject: `Your ${MAIL_APP_NAME} password reset code`,
      intro: "Use this code to reset your password.",
    };
  }
  if (purpose === OTP_PURPOSE_LOGIN) {
    return {
      subject: `Your ${MAIL_APP_NAME} sign-in code`,
      intro: "Use this code to sign in.",
    };
  }
  return {
    subject: `Your ${MAIL_APP_NAME} verification code`,
    intro: "Use this code to finish creating your account.",
  };
}

function otpTemplate(code: string, intro: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OTP Verification</title>
  <style>
    @media only screen and (max-width: 480px) {
      .wrapper {
        width: 100% !important;
        padding: 18px !important;
      }
      .otp-box {
        font-size: 26px !important;
        letter-spacing: 12px !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#e8eef7; font-family:Arial, Helvetica, sans-serif;">
  <center style="width:100%; padding:32px 0;">
    <table role="presentation" class="wrapper"
      style="width:450px; max-width:450px; background:#ffffff; border-radius:14px;
             padding:28px; box-shadow:0 4px 18px rgba(0, 80, 170, 0.15);">
      <tr>
        <td style="padding:16px 0; text-align:center;
                   background:linear-gradient(135deg, #0a2e73, #2563eb);
                   border-radius:12px; color:#ffffff; font-size:18px; font-weight:600;">
          ${MAIL_APP_NAME} verification
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px; text-align:center; font-size:15px; color:#3b4a66;">
          ${intro}
        </td>
      </tr>
      <tr>
        <td style="padding-top:22px; text-align:center;">
          <div class="otp-box" style="
            display:inline-block;
            padding:22px 34px;
            background:#f0f6ff;
            border-radius:12px;
            border:1px solid #c8d8f3;
            font-size:32px;
            font-weight:700;
            color:#0a2e73;
            font-family:'Courier New', Courier, monospace;
            letter-spacing:8px;
          ">
           ${code}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding-top:22px; text-align:center; font-size:15px; color:#3b4a66;">
          This code is valid for <strong>${OTP_TTL_MINUTES} minutes</strong>.
        </td>
      </tr>
      <tr><td style="padding-bottom:12px;"></td></tr>
    </table>
  </center>
</body>
</html>
`;
}

function client(apiKey: string) {
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}
