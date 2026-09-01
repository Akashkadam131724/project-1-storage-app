import type { AuthProvider } from "../../shared/constants/index.js";
import type { PublicUser } from "../user/user.model.js";
import type {
  githubLoginSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import type { z } from "zod";

export type RequestOtpBody = z.infer<typeof requestOtpSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type GoogleLoginBody = z.infer<typeof googleLoginSchema>;
export type GithubLoginBody = z.infer<typeof githubLoginSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;

export type SignInResult = {
  sessionId: string;
  profile: PublicUser;
};

export type OAuthProfile = {
  provider: Extract<AuthProvider, "google" | "github">;
  email: string;
  name: string;
  picture: string;
};
