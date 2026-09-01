import { randomBytes } from "node:crypto";
import axios from "axios";
import type { Response } from "express";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { env } from "../../config/env.js";
import {
  GITHUB_OAUTH_SCOPES,
  GITHUB_STATE_COOKIE,
  OAUTH_STATE_TTL_MS,
} from "../../shared/constants/index.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import type { OAuthProfile } from "./auth.types.js";

type GithubCredentials = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
};

const stateCookie = {
  httpOnly: true,
  signed: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
  maxAge: OAUTH_STATE_TTL_MS,
};

function oauthUnavailable(provider: "Google" | "GitHub") {
  return new ApiError({
    code: ErrorCode.OAUTH_UNAVAILABLE,
    message: `${provider} login is not configured`,
    status: HttpStatus.SERVICE_UNAVAILABLE,
  });
}

function oauthFailed(message: string) {
  return new ApiError({
    code: ErrorCode.OAUTH_FAILED,
    message,
    status: HttpStatus.UNAUTHORIZED,
  });
}

export function newOauthState() {
  return randomBytes(16).toString("hex");
}

export function attachGithubStateCookie(res: Response, state: string) {
  res.cookie(GITHUB_STATE_COOKIE, state, stateCookie);
}

export function clearGithubStateCookie(res: Response) {
  res.clearCookie(GITHUB_STATE_COOKIE, stateCookie);
}

export function readGithubState(signedCookies: Record<string, unknown>) {
  const value = signedCookies[GITHUB_STATE_COOKIE];
  return typeof value === "string" ? value : undefined;
}

export function clientAuthRedirect(status: "ok" | "error") {
  const url = new URL(env.CLIENT_ORIGIN);
  url.searchParams.set("auth", status);
  return url.toString();
}

export async function profileFromGoogleIdToken(
  idToken: string,
): Promise<OAuthProfile> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw oauthUnavailable("Google");
  }

  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    return payloadToProfile(ticket.getPayload());
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw oauthFailed("Google token could not be verified");
  }
}

function payloadToProfile(payload: TokenPayload | undefined): OAuthProfile {
  if (!payload?.email || payload.email_verified !== true) {
    throw oauthFailed("Google account email is missing or unverified");
  }

  return {
    provider: "google",
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0] || "User",
    picture: payload.picture ?? "",
  };
}

function githubCredentials(): GithubCredentials {
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw oauthUnavailable("GitHub");
  }
  return { clientId, clientSecret, callbackUrl: env.GITHUB_CALLBACK_URL };
}

export function githubAuthorizeUrl(state: string) {
  const { clientId, callbackUrl } = githubCredentials();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("scope", GITHUB_OAUTH_SCOPES);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function profileFromGithubCode(
  code: string,
): Promise<OAuthProfile> {
  const credentials = githubCredentials();
  const token = await exchangeGithubCode(code, credentials);
  const { name, picture } = await fetchGithubUser(token);
  const email = await fetchGithubEmail(token);

  if (!email) {
    throw oauthFailed("GitHub email is missing or unverified");
  }

  return {
    provider: "github",
    email: email.toLowerCase(),
    name,
    picture,
  };
}

async function exchangeGithubCode(
  code: string,
  credentials: GithubCredentials,
) {
  try {
    const { data } = await axios.post<{ access_token?: string }>(
      "https://github.com/login/oauth/access_token",
      {
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
        redirect_uri: credentials.callbackUrl,
      },
      { headers: { Accept: "application/json" } },
    );
    if (!data.access_token) {
      throw oauthFailed("GitHub authorization code is invalid");
    }
    return data.access_token;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw oauthFailed("GitHub authorization code is invalid");
  }
}

async function fetchGithubUser(token: string) {
  const user = await githubApi<{
    name?: string;
    login?: string;
    avatar_url?: string;
  }>("/user", token);
  return {
    name: user.name?.trim() || user.login || "User",
    picture: user.avatar_url ?? "",
  };
}

async function fetchGithubEmail(token: string) {
  const emails = await githubApi<
    Array<{ email?: string; primary?: boolean; verified?: boolean }>
  >("/user/emails", token);
  if (!Array.isArray(emails)) return null;
  const match =
    emails.find((item) => item.primary && item.verified) ??
    emails.find((item) => item.verified);
  return match?.email ?? null;
}

async function githubApi<T>(path: string, token: string): Promise<T> {
  try {
    const { data } = await axios.get<T>(`https://api.github.com${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "storage-app-v2",
      },
    });
    return data;
  } catch {
    throw oauthFailed("GitHub profile could not be loaded");
  }
}
