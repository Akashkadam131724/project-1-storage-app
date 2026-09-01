import bcrypt from "bcryptjs";
import { env } from "../../config/env.js";
import {
  BCRYPT_ROUNDS,
  BCRYPT_ROUNDS_TEST,
} from "../../shared/constants/index.js";

export async function hashPassword(plain: string) {
  const rounds = env.NODE_ENV === "test" ? BCRYPT_ROUNDS_TEST : BCRYPT_ROUNDS;
  return bcrypt.hash(plain, rounds);
}

export async function verifyPassword(plain: string, passwordHash: string) {
  return bcrypt.compare(plain, passwordHash);
}
