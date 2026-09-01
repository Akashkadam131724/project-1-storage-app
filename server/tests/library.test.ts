import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

async function signedInAgent(email = "ada@example.com") {
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

describe("trash, starred, and recent", () => {
  it("trashes a file, lists it, and keeps storage until purge", async () => {
    const agent = await signedInAgent();
    const payload = Buffer.from("keep until purge");
    const uploaded = await agent
      .post("/api/files")
      .attach("file", payload, "notes.txt")
      .expect(201);
    const fileId = uploaded.body.data.id as string;

    await agent.delete(`/api/files/${fileId}`).expect(200);

    const trash = await agent.get("/api/trash").expect(200);
    expect(
      trash.body.data.files.items.map((item: { name: string }) => item.name),
    ).toEqual(["notes.txt"]);

    const homeWhileTrashed = await agent.get("/api/directories").expect(200);
    expect(homeWhileTrashed.body.data.files.items).toEqual([]);
    expect(homeWhileTrashed.body.data.folder.size).toBe(payload.length);

    await agent
      .post("/api/files")
      .attach("file", Buffer.from("other"), "notes.txt")
      .expect(201);

    const restoreConflict = await agent.post(`/api/files/${fileId}/restore`);
    expect(restoreConflict.status).toBe(409);
    expect(restoreConflict.body.code).toBe("NAME_TAKEN");
  });

  it("restores a trashed file when the name is free", async () => {
    const agent = await signedInAgent("restore@example.com");
    const uploaded = await agent
      .post("/api/files")
      .attach("file", Buffer.from("body"), "notes.txt")
      .expect(201);
    const fileId = uploaded.body.data.id as string;

    await agent.delete(`/api/files/${fileId}`).expect(200);
    await agent.post(`/api/files/${fileId}/restore`).expect(200);

    const home = await agent.get("/api/directories").expect(200);
    expect(home.body.data.files.items[0].name).toBe("notes.txt");
    expect((await agent.get("/api/trash")).body.data.files.items).toEqual([]);
  });

  it("permanently deletes a trashed file and frees storage", async () => {
    const agent = await signedInAgent("purge@example.com");
    const payload = Buffer.from("gone");
    const uploaded = await agent
      .post("/api/files")
      .attach("file", payload, "gone.txt")
      .expect(201);
    const fileId = uploaded.body.data.id as string;

    await agent.delete(`/api/files/${fileId}`).expect(200);
    await agent.delete(`/api/files/${fileId}/permanent`).expect(200);

    expect((await agent.get(`/api/files/${fileId}`)).status).toBe(404);
    const home = await agent.get("/api/directories").expect(200);
    expect(home.body.data.folder.size).toBe(0);
    expect((await agent.get("/api/trash")).body.data.files.items).toEqual([]);
  });

  it("lists only the folder that was explicitly trashed", async () => {
    const agent = await signedInAgent("nested-trash@example.com");
    const parent = await agent
      .post("/api/directories")
      .send({ name: "Docs" })
      .expect(201);
    const child = await agent
      .post("/api/directories")
      .send({ name: "Notes", parentId: parent.body.data.id })
      .expect(201);
    await agent
      .post("/api/files")
      .field("parentId", parent.body.data.id as string)
      .attach("file", Buffer.from("inside"), "inside.txt")
      .expect(201);

    await agent
      .delete(`/api/directories/${parent.body.data.id as string}`)
      .expect(200);

    const trash = await agent.get("/api/trash").expect(200);
    expect(
      trash.body.data.folders.items.map((item: { name: string }) => item.name),
    ).toEqual(["Docs"]);
    expect(trash.body.data.files.items).toEqual([]);
    expect(
      (await agent.get(`/api/directories/${child.body.data.id as string}`))
        .status,
    ).toBe(404);

    await agent
      .post(`/api/directories/${parent.body.data.id as string}/restore`)
      .expect(200);
    await agent
      .get(`/api/directories/${child.body.data.id as string}`)
      .expect(200);
  });

  it("stars and unstars items, then lists them", async () => {
    const agent = await signedInAgent("star@example.com");
    const folder = await agent
      .post("/api/directories")
      .send({ name: "Docs" })
      .expect(201);
    const uploaded = await agent
      .post("/api/files")
      .attach("file", Buffer.from("star me"), "star.txt")
      .expect(201);

    await agent
      .post(`/api/directories/${folder.body.data.id as string}/star`)
      .expect(200);
    await agent
      .post(`/api/files/${uploaded.body.data.id as string}/star`)
      .expect(200);

    const starred = await agent.get("/api/starred").expect(200);
    expect(
      starred.body.data.folders.items.map(
        (item: { name: string }) => item.name,
      ),
    ).toEqual(["Docs"]);
    expect(
      starred.body.data.files.items.map((item: { name: string }) => item.name),
    ).toEqual(["star.txt"]);

    await agent
      .post(`/api/files/${uploaded.body.data.id as string}/unstar`)
      .expect(200);
    const after = await agent.get("/api/starred").expect(200);
    expect(after.body.data.files.items).toEqual([]);
  });

  it("records recent files when metadata or content is opened", async () => {
    const agent = await signedInAgent("recent@example.com");
    const uploaded = await agent
      .post("/api/files")
      .attach("file", Buffer.from("open me"), "recent.txt")
      .expect(201);
    const fileId = uploaded.body.data.id as string;

    expect((await agent.get("/api/recent")).body.data.items).toEqual([]);

    await agent.get(`/api/files/${fileId}`).expect(200);
    const recent = await agent.get("/api/recent").expect(200);
    expect(
      recent.body.data.items.map((item: { name: string }) => item.name),
    ).toEqual(["recent.txt"]);
  });
});
