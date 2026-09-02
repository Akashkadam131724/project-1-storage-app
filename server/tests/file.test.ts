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

describe("files", () => {
  it("uploads, downloads, renames, and deletes a file", async () => {
    const agent = await signedInAgent();
    const payload = Buffer.from("hello storage");

    const uploaded = await agent
      .post("/api/files")
      .attach("file", payload, "hello.txt")
      .expect(201);

    const fileId = uploaded.body.data.id as string;
    expect(uploaded.body.data.name).toBe("hello.txt");
    expect(uploaded.body.data.size).toBe(payload.length);

    const listing = await agent.get("/api/directories").expect(200);
    expect(listing.body.data.files.items[0].name).toBe("hello.txt");
    expect(listing.body.data.folder.size).toBe(payload.length);

    const download = await agent
      .get(`/api/files/${fileId}/content`)
      .expect(200);
    expect(download.text).toBe("hello storage");
    expect(download.headers["content-disposition"]).toMatch(/^inline;/);

    const saved = await agent
      .get(`/api/files/${fileId}/content`)
      .query({ download: "1" })
      .expect(200);
    expect(saved.headers["content-disposition"]).toMatch(/^attachment;/);

    await agent
      .patch(`/api/files/${fileId}`)
      .send({ name: "notes.txt" })
      .expect(200);

    const meta = await agent.get(`/api/files/${fileId}`).expect(200);
    expect(meta.body.data.name).toBe("notes.txt");

    await agent.delete(`/api/files/${fileId}`).expect(200);
    expect((await agent.get(`/api/files/${fileId}`)).status).toBe(404);

    const emptyHome = await agent.get("/api/directories").expect(200);
    expect(emptyHome.body.data.files.items).toEqual([]);
    expect(emptyHome.body.data.folder.size).toBe(payload.length);
  });

  it("rejects a duplicate file name in the same folder", async () => {
    const agent = await signedInAgent();
    await agent
      .post("/api/files")
      .attach("file", Buffer.from("a"), "same.txt")
      .expect(201);

    const duplicate = await agent
      .post("/api/files")
      .attach("file", Buffer.from("b"), "same.txt");

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.code).toBe("NAME_TAKEN");
  });

  it("requires a session to upload", async () => {
    const response = await request(app)
      .post("/api/files")
      .attach("file", Buffer.from("x"), "x.txt");
    expect(response.status).toBe(401);
  });
});
