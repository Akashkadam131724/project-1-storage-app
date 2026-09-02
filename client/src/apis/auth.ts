import { apiRequest } from "./http.ts";
import type { PublicUser } from "./types.ts";

export function requestSignupCode(email: string) {
  return apiRequest<{ code?: string }>("/api/auth/otp", {
    method: "POST",
    body: JSON.stringify({ email }),
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

export function signIn(email: string, password: string) {
  return apiRequest<PublicUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signInWithGoogle(idToken: string) {
  return apiRequest<PublicUser>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

export function startGithubSignIn() {
  return apiRequest<{ url: string }>("/api/auth/github/start");
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
