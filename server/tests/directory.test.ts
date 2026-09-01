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

describe("directories", () => {
  it("lists Home after signup", async () => {
    const agent = await signedInAgent();
    const response = await agent.get("/api/directories").expect(200);

    expect(response.body.data.folder.name).toBe("Home");
    expect(response.body.data.folder.isRoot).toBe(true);
    expect(response.body.data.folders).toEqual([]);
    expect(response.body.data.files).toEqual([]);
  });

  it("creates, lists, and renames a nested folder", async () => {
    const agent = await signedInAgent();
    const created = await agent
      .post("/api/directories")
      .send({ name: "Docs" })
      .expect(201);

    const folderId = created.body.data.id as string;
    const nested = await agent
      .post("/api/directories")
      .send({ name: "Notes", parentId: folderId })
      .expect(201);

    const listing = await agent.get(`/api/directories/${folderId}`).expect(200);
    expect(
      listing.body.data.folders.map((item: { name: string }) => item.name),
    ).toEqual(["Notes"]);
    expect(listing.body.data.ancestors[0].name).toBe("Home");

    await agent
      .patch(`/api/directories/${nested.body.data.id as string}`)
      .send({ name: "Journal" })
      .expect(200);

    const renamed = await agent.get(`/api/directories/${folderId}`).expect(200);
    expect(renamed.body.data.folders[0].name).toBe("Journal");
  });

  it("rejects a duplicate folder name in the same parent", async () => {
    const agent = await signedInAgent();
    await agent.post("/api/directories").send({ name: "Docs" }).expect(201);
    const duplicate = await agent
      .post("/api/directories")
      .send({ name: "Docs" });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.code).toBe("NAME_TAKEN");
  });

  it("does not allow deleting Home", async () => {
    const agent = await signedInAgent();
    const root = await agent.get("/api/directories").expect(200);
    const response = await agent.delete(
      `/api/directories/${root.body.data.folder.id as string}`,
    );
    expect(response.status).toBe(403);
  });

  it("deletes a folder and its contents", async () => {
    const agent = await signedInAgent();
    const parent = await agent
      .post("/api/directories")
      .send({ name: "Docs" })
      .expect(201);
    const child = await agent
      .post("/api/directories")
      .send({ name: "Notes", parentId: parent.body.data.id })
      .expect(201);

    await agent
      .delete(`/api/directories/${parent.body.data.id as string}`)
      .expect(200);

    const missing = await agent.get(
      `/api/directories/${child.body.data.id as string}`,
    );
    expect(missing.status).toBe(404);

    const home = await agent.get("/api/directories").expect(200);
    expect(home.body.data.folders).toEqual([]);
  });
});
