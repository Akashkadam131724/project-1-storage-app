export const SESSION_COOKIE_NAME = "sid";
export const SESSION_TTL_DAYS = 7;
export const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;
export const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

export const OTP_LENGTH = 4;
export const OTP_TTL_SECONDS = 10 * 60;
export const OTP_MIN = 10 ** (OTP_LENGTH - 1);
export const OTP_MAX = 10 ** OTP_LENGTH;

export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MIN_LENGTH = 2;

export const BCRYPT_ROUNDS = 12;
export const BCRYPT_ROUNDS_TEST = 4;

export const AUTH_PROVIDERS = ["password", "google", "github"] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];
export const DEFAULT_AUTH_PROVIDER = "password" satisfies AuthProvider;

export const GITHUB_STATE_COOKIE = "gh_oauth_state";
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
export const GITHUB_OAUTH_SCOPES = "read:user user:email";

export const OTP_PURPOSES = ["signup", "login", "reset"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];
export const OTP_PURPOSE_SIGNUP = "signup" satisfies OtpPurpose;
export const OTP_PURPOSE_LOGIN = "login" satisfies OtpPurpose;
export const OTP_PURPOSE_RESET = "reset" satisfies OtpPurpose;
