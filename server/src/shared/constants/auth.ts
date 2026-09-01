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
