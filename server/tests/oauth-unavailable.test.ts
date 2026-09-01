import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("oauth when providers are not configured", () => {
  it("returns 503 for Google login", async () => {
    const response = await request(app)
      .post("/api/auth/google")
      .send({ idToken: "any-token" });

    expect(response.status).toBe(503);
    expect(response.body.code).toBe("OAUTH_UNAVAILABLE");
  });

  it("returns 503 for GitHub start", async () => {
    const response = await request(app).get("/api/auth/github/start");

    expect(response.status).toBe(503);
    expect(response.body.code).toBe("OAUTH_UNAVAILABLE");
  });

  it("returns 503 for GitHub code exchange", async () => {
    const response = await request(app)
      .post("/api/auth/github")
      .send({ code: "any-code" });

    expect(response.status).toBe(503);
    expect(response.body.code).toBe("OAUTH_UNAVAILABLE");
  });
});
