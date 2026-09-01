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

describe("move and copy", () => {
  it("moves a file into another folder", async () => {
    const agent = await signedInAgent("move-file@example.com");
    const folder = await agent
      .post("/api/directories")
      .send({ name: "Docs" })
      .expect(201);
    const uploaded = await agent
      .post("/api/files")
      .attach("file", Buffer.from("hello"), "hello.txt")
      .expect(201);

    await agent
      .post(`/api/files/${uploaded.body.data.id as string}/move`)
      .send({ parentId: folder.body.data.id })
      .expect(200);

    const home = await agent.get("/api/directories").expect(200);
    expect(home.body.data.files).toEqual([]);
    expect(home.body.data.folder.size).toBe("hello".length);

    const docs = await agent
      .get(`/api/directories/${folder.body.data.id as string}`)
      .expect(200);
    expect(docs.body.data.files[0].name).toBe("hello.txt");
    expect(docs.body.data.folder.size).toBe("hello".length);
  });

  it("copies a file with a (copy) suffix in the same folder", async () => {
    const agent = await signedInAgent("copy-file@example.com");
    const uploaded = await agent
      .post("/api/files")
      .attach("file", Buffer.from("hello"), "hello.txt")
      .expect(201);

    const copied = await agent
      .post(`/api/files/${uploaded.body.data.id as string}/copy`)
      .send({})
      .expect(201);

    expect(copied.body.data.name).toBe("hello (copy).txt");
    const home = await agent.get("/api/directories").expect(200);
    expect(home.body.data.files).toHaveLength(2);
    expect(home.body.data.folder.size).toBe("hello".length * 2);

    const download = await agent
      .get(`/api/files/${copied.body.data.id as string}/content`)
      .expect(200);
    expect(download.text).toBe("hello");
  });

  it("moves a folder and rejects moving it into itself", async () => {
    const agent = await signedInAgent("move-folder@example.com");
    const docs = await agent
      .post("/api/directories")
      .send({ name: "Docs" })
      .expect(201);
    const notes = await agent
      .post("/api/directories")
      .send({ name: "Notes", parentId: docs.body.data.id })
      .expect(201);
    const projects = await agent
      .post("/api/directories")
      .send({ name: "Projects" })
      .expect(201);

    const intoSelf = await agent
      .post(`/api/directories/${docs.body.data.id as string}/move`)
      .send({ parentId: notes.body.data.id });
    expect(intoSelf.status).toBe(409);
    expect(intoSelf.body.code).toBe("INVALID_PARENT");

    await agent
      .post(`/api/directories/${docs.body.data.id as string}/move`)
      .send({ parentId: projects.body.data.id })
      .expect(200);

    const listing = await agent
      .get(`/api/directories/${projects.body.data.id as string}`)
      .expect(200);
    expect(listing.body.data.folders[0].name).toBe("Docs");
  });

  it("copies a folder tree", async () => {
    const agent = await signedInAgent("copy-folder@example.com");
    const docs = await agent
      .post("/api/directories")
      .send({ name: "Docs" })
      .expect(201);
    await agent
      .post("/api/directories")
      .send({ name: "Notes", parentId: docs.body.data.id })
      .expect(201);
    await agent
      .post("/api/files")
      .field("parentId", docs.body.data.id as string)
      .attach("file", Buffer.from("inside"), "inside.txt")
      .expect(201);

    const copied = await agent
      .post(`/api/directories/${docs.body.data.id as string}/copy`)
      .send({})
      .expect(201);

    expect(copied.body.data.name).toBe("Docs (copy)");
    const listing = await agent
      .get(`/api/directories/${copied.body.data.id as string}`)
      .expect(200);
    expect(
      listing.body.data.folders.map((item: { name: string }) => item.name),
    ).toEqual(["Notes"]);
    expect(
      listing.body.data.files.map((item: { name: string }) => item.name),
    ).toEqual(["inside.txt"]);
    expect(listing.body.data.folder.size).toBe("inside".length);
  });
});
