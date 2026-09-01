import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("app", () => {
  it("returns a not-found payload for unknown routes", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      code: "NOT_FOUND",
    });
  });
});
