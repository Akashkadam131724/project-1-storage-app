import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import {
  githubAuthorizeUrl,
  profileFromGithubCode,
  profileFromGoogleAuthCode,
} from "../src/modules/auth/oauth.service.js";
import type * as oauthService from "../src/modules/auth/oauth.service.js";
import { UserModel } from "../src/modules/user/user.model.js";
import { passwordLogin, registerUser } from "./auth-helpers.js";

vi.mock("../src/modules/auth/oauth.service.js", async (importOriginal) => {
  const actual = await importOriginal<typeof oauthService>();
  return {
    ...actual,
    profileFromGoogleAuthCode: vi.fn(),
    profileFromGithubCode: vi.fn(),
    githubAuthorizeUrl: vi.fn(),
  };
});

const app = createApp();

const googleProfile = {
  provider: "google" as const,
  email: "google.user@example.com",
  name: "Google User",
  picture: "https://example.com/google.png",
};

const githubProfile = {
  provider: "github" as const,
  email: "github.user@example.com",
  name: "GitHub User",
  picture: "https://example.com/github.png",
};

describe("oauth", () => {
  beforeEach(() => {
    vi.mocked(profileFromGoogleAuthCode).mockReset();
    vi.mocked(profileFromGithubCode).mockReset();
    vi.mocked(githubAuthorizeUrl).mockReset();
  });

  it("creates a session from a Google authorization code", async () => {
    vi.mocked(profileFromGoogleAuthCode).mockResolvedValue(googleProfile);
    const agent = request.agent(app);

    const login = await agent
      .post("/api/auth/google")
      .send({ code: "google-auth-code" });

    expect(login.status).toBe(200);
    expect(login.body.data.email).toBe(googleProfile.email);

    const me = await agent.get("/api/users/me");
    expect(me.status).toBe(200);
    expect(me.body.data.name).toBe("Google User");
  });

  it("links Google to an existing password account", async () => {
    const agent = request.agent(app);
    await registerUser(agent, "ada@example.com");

    vi.mocked(profileFromGoogleAuthCode).mockResolvedValue({
      ...googleProfile,
      email: "ada@example.com",
      picture: "https://example.com/linked.png",
    });

    const login = await agent
      .post("/api/auth/google")
      .send({ code: "google-auth-code" });

    expect(login.status).toBe(200);
    expect(login.body.data.email).toBe("ada@example.com");

    await passwordLogin(request.agent(app), "ada@example.com");
  });

  it("rejects password login for an OAuth-only account", async () => {
    vi.mocked(profileFromGoogleAuthCode).mockResolvedValue(googleProfile);
    await request(app)
      .post("/api/auth/google")
      .send({ code: "google-auth-code" })
      .expect(200);

    const login = await request(app).post("/api/auth/otp").send({
      email: googleProfile.email,
      action: "login",
      password: "password1",
    });

    expect(login.status).toBe(401);
    expect(login.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects OAuth for a disabled account", async () => {
    vi.mocked(profileFromGoogleAuthCode).mockResolvedValue(googleProfile);
    await request(app)
      .post("/api/auth/google")
      .send({ code: "google-auth-code" })
      .expect(200);

    await UserModel.updateOne(
      { email: googleProfile.email },
      { isDeleted: true },
    );

    const login = await request(app)
      .post("/api/auth/google")
      .send({ code: "google-auth-code" });

    expect(login.status).toBe(403);
    expect(login.body.code).toBe("ACCOUNT_DISABLED");
  });

  it("creates a session from a GitHub authorization code", async () => {
    vi.mocked(profileFromGithubCode).mockResolvedValue(githubProfile);
    const agent = request.agent(app);

    const login = await agent
      .post("/api/auth/github")
      .send({ code: "github-code" });

    expect(login.status).toBe(200);
    expect(login.body.data.email).toBe(githubProfile.email);

    const me = await agent.get("/api/users/me");
    expect(me.status).toBe(200);
    expect(me.body.data.name).toBe("GitHub User");
  });

  it("redirects to GitHub and sets state", async () => {
    vi.mocked(githubAuthorizeUrl).mockReturnValue(
      "https://github.com/login/oauth/authorize?client_id=test",
    );

    const response = await request(app).get("/api/auth/github").redirects(0);

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain(
      "github.com/login/oauth/authorize",
    );
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("gh_oauth_state=")]),
    );
  });

  it("redirects to the client after a GitHub callback", async () => {
    vi.mocked(profileFromGithubCode).mockResolvedValue(githubProfile);
    vi.mocked(githubAuthorizeUrl).mockImplementation(
      (state: string) =>
        `https://github.com/login/oauth/authorize?state=${state}`,
    );

    const agent = request.agent(app);
    const start = await agent.get("/api/auth/github/start").redirects(0);
    expect(start.status).toBe(302);
    const authorizeUrl = new URL(start.headers.location as string);
    const state = authorizeUrl.searchParams.get("state");

    const callback = await agent.get("/api/auth/github/callback").query({
      code: "github-code",
      state,
    });

    expect(callback.status).toBe(302);
    expect(callback.headers.location).toContain("auth=ok");

    const me = await agent.get("/api/users/me");
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(githubProfile.email);
  });
});
