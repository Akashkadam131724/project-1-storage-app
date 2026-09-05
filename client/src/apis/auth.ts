import { apiRequest } from "./http.ts";
import type { PublicUser } from "./types.ts";
import { env } from "../utils/env.ts";

export function requestAuthCode(input: {
  email: string;
  action: "login" | "register";
  password?: string;
}) {
  return apiRequest<{ code?: string }>("/api/auth/otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  code: string;
}) {
  return apiRequest<undefined>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function signIn(email: string, password: string, code: string) {
  return apiRequest<PublicUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, code }),
  });
}

export function continueAsGuest() {
  return apiRequest<PublicUser>("/api/auth/guest", { method: "POST" });
}

export function signInWithGoogle(code: string) {
  return apiRequest<PublicUser>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function githubSignInUrl() {
  const base = env.VITE_API_URL.replace(/\/$/, "");
  return `${base}/api/auth/github`;
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ code?: string }>("/api/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(input: {
  email: string;
  code: string;
  password: string;
}) {
  return apiRequest<undefined>("/api/auth/password/reset", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function signOut() {
  return apiRequest<undefined>("/api/auth/logout", { method: "POST" });
}

export function signOutAll() {
  return apiRequest<undefined>("/api/auth/logout-all", { method: "POST" });
}
