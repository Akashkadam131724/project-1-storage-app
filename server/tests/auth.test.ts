import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

async function signup(agent: ReturnType<typeof request.agent>, email: string) {
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
}

describe("auth", () => {
  it("rejects a short password on register", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
      code: "1234",
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("creates an account with a verification code then signs in", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");

    const login = await agent.post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password1",
    });

    expect(login.status).toBe(200);
    expect(login.body.data.email).toBe("ada@example.com");
    expect(login.body.data.storageLimitBytes).toBe(500 * 1024 * 1024);

    const me = await agent.get("/api/users/me");
    expect(me.status).toBe(200);
    expect(me.body.data.name).toBe("Ada Lovelace");
  });

  it("does not issue a code for an existing email", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");

    const otp = await request(app)
      .post("/api/auth/otp")
      .send({ email: "ada@example.com" });

    expect(otp.status).toBe(409);
    expect(otp.body.code).toBe("EMAIL_TAKEN");
  });

  it("rejects a wrong password", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");

    const login = await request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "wrong-pass",
    });

    expect(login.status).toBe(401);
    expect(login.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("clears the session on logout", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await agent.post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password1",
    });

    await agent.post("/api/auth/logout").expect(200);

    const me = await agent.get("/api/users/me");
    expect(me.status).toBe(401);
  });

  it("resets a password with a verification code", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await agent.post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password1",
    });

    const forgot = await request(app)
      .post("/api/auth/password/forgot")
      .send({ email: "ada@example.com" })
      .expect(200);

    expect(forgot.body.data.code).toMatch(/^\d{4}$/);

    await request(app)
      .post("/api/auth/password/reset")
      .send({
        email: "ada@example.com",
        code: forgot.body.data.code,
        password: "password2",
      })
      .expect(200);

    const stale = await agent.get("/api/users/me");
    expect(stale.status).toBe(401);

    const login = await request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password2",
    });
    expect(login.status).toBe(200);
  });

  it("does not leak whether an email exists on forgot password", async () => {
    const response = await request(app)
      .post("/api/auth/password/forgot")
      .send({ email: "missing@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.data.code).toBeUndefined();
  });

  it("signs out every session", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await agent.post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password1",
    });

    const other = request.agent(app);
    await other.post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password1",
    });

    await agent.post("/api/auth/logout-all").expect(200);

    expect((await agent.get("/api/users/me")).status).toBe(401);
    expect((await other.get("/api/users/me")).status).toBe(401);
  });

  it("starts a guest session without an email", async () => {
    const agent = request.agent(app);
    const guest = await agent.post("/api/auth/guest").expect(200);

    expect(guest.body.data.isGuest).toBe(true);
    expect(guest.body.data.name).toBe("Guest");
    expect(guest.body.data.hasPassword).toBe(false);
    expect(guest.body.data.storageLimitBytes).toBe(25 * 1024 * 1024);

    const me = await agent.get("/api/users/me").expect(200);
    expect(me.body.data.id).toBe(guest.body.data.id);
    expect(me.body.data.rootDirId).toBe(guest.body.data.rootDirId);
  });

  it("keeps guest files when converting to a real account", async () => {
    const agent = request.agent(app);
    const guest = await agent.post("/api/auth/guest").expect(200);
    const rootDirId = guest.body.data.rootDirId as string;

    await agent
      .post("/api/files")
      .attach("file", Buffer.from("keep me"), "notes.txt")
      .expect(201);

    const email = "kept@example.com";
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

    const me = await agent.get("/api/users/me").expect(200);
    expect(me.body.data.isGuest).toBe(false);
    expect(me.body.data.email).toBe(email);
    expect(me.body.data.hasPassword).toBe(true);
    expect(me.body.data.storageLimitBytes).toBe(500 * 1024 * 1024);
    expect(me.body.data.rootDirId).toBe(rootDirId);

    const listing = await agent.get("/api/directories").expect(200);
    expect(listing.body.data.files.items[0].name).toBe("notes.txt");

    await agent.post("/api/auth/logout").expect(200);
    const login = await agent.post("/api/auth/login").send({
      email,
      password: "password1",
    });
    expect(login.status).toBe(200);
    expect(login.body.data.rootDirId).toBe(rootDirId);
  });

  it("deletes a guest drive on logout", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/guest").expect(200);
    await agent.post("/api/directories").send({ name: "temp" }).expect(201);

    await agent.post("/api/auth/logout").expect(200);
    expect((await agent.get("/api/users/me")).status).toBe(401);

    await agent.post("/api/auth/guest").expect(200);
    const listing = await agent.get("/api/directories").expect(200);
    expect(listing.body.data.folders.items).toHaveLength(0);
    expect(listing.body.data.files.items).toHaveLength(0);
  });
});

describe("GET /api/users/me", () => {
  it("requires a session", async () => {
    const response = await request(app).get("/api/users/me");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});
