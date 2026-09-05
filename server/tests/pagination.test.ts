import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { signedInAgent as signedInAgentFor } from "./auth-helpers.js";
import {
  paginateArray,
  paginationQuerySchema,
} from "../src/shared/pagination/index.js";

const app = createApp();

async function signedInAgent(email = "ada@example.com") {
  return signedInAgentFor(app, email);
}

describe("pagination helper", () => {
  it("parses missing query values to defaults", () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
  });

  it("slices an array into a page", () => {
    const items = ["a", "b", "c", "d", "e"];
    expect(paginateArray(items, { page: 2, limit: 2 })).toEqual({
      items: ["c", "d"],
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });
});

describe("paginated list endpoints", () => {
  it("pages folder children and rejects an invalid page", async () => {
    const agent = await signedInAgent("page@example.com");
    await agent.post("/api/directories").send({ name: "Alpha" }).expect(201);
    await agent.post("/api/directories").send({ name: "Beta" }).expect(201);
    await agent.post("/api/directories").send({ name: "Gamma" }).expect(201);

    const page1 = await agent
      .get("/api/directories")
      .query({ page: 1, limit: 2 })
      .expect(200);
    expect(
      page1.body.data.folders.items.map((item: { name: string }) => item.name),
    ).toEqual(["Alpha", "Beta"]);
    expect(page1.body.data.folders.total).toBe(3);
    expect(page1.body.data.folders.totalPages).toBe(2);

    const page2 = await agent
      .get("/api/directories")
      .query({ page: 2, limit: 2 })
      .expect(200);
    expect(
      page2.body.data.folders.items.map((item: { name: string }) => item.name),
    ).toEqual(["Gamma"]);

    const invalid = await agent.get("/api/directories").query({ page: 0 });
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe("VALIDATION_ERROR");
  });
});
