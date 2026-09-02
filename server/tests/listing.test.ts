import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import {
  listingQueryOf,
  listingQuerySchema,
} from "../src/shared/listing/index.js";

const app = createApp();

async function signedInAgent(email: string) {
  const agent = request.agent(app);
  const otp = await agent.post("/api/auth/otp").send({ email }).expect(200);
  await agent
    .post("/api/auth/register")
    .send({
      name: "Ada Lovelace",
      email,
      password: "password1",
      code: otp.body.data.code,
    })
    .expect(201);
  await agent
    .post("/api/auth/login")
    .send({ email, password: "password1" })
    .expect(200);
  return agent;
}

function names(items: { name: string }[]) {
  return items.map((item) => item.name);
}

function entryNames(
  items: Array<
    | { type: "folder"; folder: { name: string } }
    | { type: "file"; file: { name: string } }
  >,
) {
  return items.map((item) =>
    item.type === "folder" ? item.folder.name : item.file.name,
  );
}

describe("listing query", () => {
  it("keeps pagination defaults and fills listing defaults per context", () => {
    expect(listingQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(listingQueryOf({}, "children")).toMatchObject({
      page: 1,
      limit: 20,
      sortDir: "asc",
      folders: "top",
    });
    expect(listingQueryOf({ sortBy: "modified" }, "children")).toMatchObject({
      sortBy: "modified",
      sortDir: "desc",
      folders: "top",
    });
    expect(listingQueryOf({ sortBy: "name" }, "trash")).toMatchObject({
      sortBy: "name",
      sortDir: "asc",
    });
  });

  it("rejects unknown sort fields", () => {
    expect(() => listingQuerySchema.parse({ sortBy: "shared" })).toThrow();
    expect(() => listingQuerySchema.parse({ folders: "beside" })).toThrow();
  });
});

describe("sorted list endpoints", () => {
  it("sorts folder children by name and by modified time", async () => {
    const agent = await signedInAgent("sort-name@example.com");
    const older = await agent
      .post("/api/directories")
      .send({ name: "Older" })
      .expect(201);
    await agent.post("/api/directories").send({ name: "Newer" }).expect(201);
    await agent
      .patch(`/api/directories/${older.body.data.id as string}`)
      .send({ name: "Older-touched" })
      .expect(200);

    const byName = await agent
      .get("/api/directories")
      .query({ sortBy: "name", sortDir: "desc", limit: 2, page: 1 })
      .expect(200);
    expect(names(byName.body.data.folders.items)).toEqual([
      "Older-touched",
      "Newer",
    ]);
    expect(byName.body.data.entries).toBeUndefined();

    const byModified = await agent
      .get("/api/directories")
      .query({ sortBy: "modified", sortDir: "desc" })
      .expect(200);
    expect(names(byModified.body.data.folders.items)).toEqual([
      "Older-touched",
      "Newer",
    ]);
  });

  it("sorts files by last opened and mixes folders with files", async () => {
    const agent = await signedInAgent("sort-opened@example.com");
    await agent.post("/api/directories").send({ name: "Beta" }).expect(201);
    const zebra = await agent
      .post("/api/files")
      .attach("file", Buffer.from("z"), "zebra.txt")
      .expect(201);
    const alpha = await agent
      .post("/api/files")
      .attach("file", Buffer.from("a"), "Alpha.txt")
      .expect(201);

    await agent.get(`/api/files/${zebra.body.data.id as string}`).expect(200);
    await agent.get(`/api/files/${alpha.body.data.id as string}`).expect(200);

    const opened = await agent
      .get("/api/directories")
      .query({ sortBy: "opened", sortDir: "desc" })
      .expect(200);
    expect(names(opened.body.data.files.items)).toEqual([
      "Alpha.txt",
      "zebra.txt",
    ]);

    const mixed = await agent
      .get("/api/directories")
      .query({ sortBy: "name", folders: "mixed", limit: 2, page: 1 })
      .expect(200);
    expect(entryNames(mixed.body.data.entries.items)).toEqual([
      "Alpha.txt",
      "Beta",
    ]);
    expect(mixed.body.data.entries.total).toBe(3);
    expect(mixed.body.data.entries.totalPages).toBe(2);
    expect(names(mixed.body.data.folders.items)).toEqual(["Beta"]);
    expect(names(mixed.body.data.files.items)).toEqual([
      "Alpha.txt",
      "zebra.txt",
    ]);

    const mixedPage2 = await agent
      .get("/api/directories")
      .query({ sortBy: "name", folders: "mixed", limit: 2, page: 2 })
      .expect(200);
    expect(entryNames(mixedPage2.body.data.entries.items)).toEqual([
      "zebra.txt",
    ]);
  });

  it("sorts trash by name and recent by opened time", async () => {
    const agent = await signedInAgent("sort-library@example.com");
    const first = await agent
      .post("/api/files")
      .attach("file", Buffer.from("b"), "bravo.txt")
      .expect(201);
    const second = await agent
      .post("/api/files")
      .attach("file", Buffer.from("a"), "alpha.txt")
      .expect(201);

    await agent
      .delete(`/api/files/${second.body.data.id as string}`)
      .expect(200);
    await agent
      .delete(`/api/files/${first.body.data.id as string}`)
      .expect(200);

    const trashDefault = await agent.get("/api/trash").expect(200);
    expect(names(trashDefault.body.data.files.items)).toEqual([
      "bravo.txt",
      "alpha.txt",
    ]);

    const trashByName = await agent
      .get("/api/trash")
      .query({ sortBy: "name", sortDir: "asc" })
      .expect(200);
    expect(names(trashByName.body.data.files.items)).toEqual([
      "alpha.txt",
      "bravo.txt",
    ]);
  });

  it("sorts recent files by name when requested", async () => {
    const agent = await signedInAgent("sort-recent@example.com");
    const zebra = await agent
      .post("/api/files")
      .attach("file", Buffer.from("z"), "zebra.txt")
      .expect(201);
    const alpha = await agent
      .post("/api/files")
      .attach("file", Buffer.from("a"), "alpha.txt")
      .expect(201);

    await agent.get(`/api/files/${alpha.body.data.id as string}`).expect(200);
    await agent.get(`/api/files/${zebra.body.data.id as string}`).expect(200);

    const recent = await agent.get("/api/recent").expect(200);
    expect(names(recent.body.data.items)).toEqual(["zebra.txt", "alpha.txt"]);

    const byName = await agent
      .get("/api/recent")
      .query({ sortBy: "name", sortDir: "asc" })
      .expect(200);
    expect(names(byName.body.data.items)).toEqual(["alpha.txt", "zebra.txt"]);
  });

  it("rejects an unknown sort query", async () => {
    const agent = await signedInAgent("sort-invalid@example.com");
    const response = await agent
      .get("/api/directories")
      .query({ sortBy: "shared" });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});
