import type { PublicUser } from "../user/user.model.js";
import type {
  loginSchema,
  registerSchema,
  requestOtpSchema,
} from "./auth.validation.js";
import type { z } from "zod";

export type RequestOtpBody = z.infer<typeof requestOtpSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;

export type SignInResult = {
  sessionId: string;
  profile: PublicUser;
};
