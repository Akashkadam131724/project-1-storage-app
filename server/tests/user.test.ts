import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { UserModel } from "../src/modules/user/user.model.js";

const app = createApp();

async function signup(
  agent: ReturnType<typeof request.agent>,
  email: string,
  name = "Ada Lovelace",
) {
  const otp = await agent.post("/api/auth/otp").send({ email }).expect(200);

  await agent
    .post("/api/auth/register")
    .send({
      name,
      email,
      password: "password1",
      code: otp.body.data.code,
    })
    .expect(201);
}

async function login(
  agent: ReturnType<typeof request.agent>,
  email: string,
  password = "password1",
) {
  await agent.post("/api/auth/login").send({ email, password }).expect(200);
}

describe("user profile and password", () => {
  it("updates the display name", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await login(agent, "ada@example.com");

    const response = await agent
      .patch("/api/users/me")
      .send({ name: "Ada King" });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Ada King");
    expect(response.body.data.hasPassword).toBe(true);
  });

  it("changes the password while signed in", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await login(agent, "ada@example.com");

    await agent
      .patch("/api/users/me/password")
      .send({ currentPassword: "password1", newPassword: "password2" })
      .expect(200);

    await agent.post("/api/auth/logout").expect(200);

    const oldLogin = await request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password1",
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password2",
    });
    expect(newLogin.status).toBe(200);
  });

  it("sets a password only when the account has none", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await login(agent, "ada@example.com");

    const existing = await agent
      .post("/api/users/me/password")
      .send({ password: "password2" });
    expect(existing.status).toBe(409);
    expect(existing.body.code).toBe("PASSWORD_ALREADY_SET");

    await UserModel.updateOne(
      { email: "ada@example.com" },
      { $unset: { passwordHash: 1 } },
    );

    await agent
      .post("/api/users/me/password")
      .send({ password: "password2" })
      .expect(200);

    await agent.post("/api/auth/logout").expect(200);
    const loginAfter = await request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password2",
    });
    expect(loginAfter.status).toBe(200);
  });

  it("disables the current account", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await login(agent, "ada@example.com");

    await agent.patch("/api/users/me/disable").expect(200);
    expect((await agent.get("/api/users/me")).status).toBe(401);

    const loginAfter = await request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password1",
    });
    expect(loginAfter.status).toBe(401);
  });

  it("deletes the current account", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await login(agent, "ada@example.com");

    await agent.delete("/api/users/me").expect(200);
    expect(await UserModel.findOne({ email: "ada@example.com" })).toBeNull();
  });
});

describe("admin users", () => {
  async function adminAgent() {
    const agent = request.agent(app);
    await signup(agent, "admin@example.com", "Admin");
    await UserModel.updateOne(
      { email: "admin@example.com" },
      { role: "Admin" },
    );
    await login(agent, "admin@example.com");
    return agent;
  }

  it("lists users and can disable, restore, and delete them", async () => {
    const userAgent = request.agent(app);
    await signup(userAgent, "ada@example.com");
    await login(userAgent, "ada@example.com");
    const me = await userAgent.get("/api/users/me").expect(200);
    const userId = me.body.data.id as string;

    const admin = await adminAgent();
    const list = await admin.get("/api/users").expect(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(2);

    await admin.patch(`/api/users/${userId}/disable`).expect(200);
    expect((await userAgent.get("/api/users/me")).status).toBe(401);

    await admin.patch(`/api/users/${userId}/restore`).expect(200);
    await login(userAgent, "ada@example.com");
    expect((await userAgent.get("/api/users/me")).status).toBe(200);

    await admin
      .patch(`/api/users/${userId}/role`)
      .send({ role: "Admin" })
      .expect(200);

    await admin.delete(`/api/users/${userId}`).expect(200);
    expect(await UserModel.findById(userId)).toBeNull();
  });

  it("rejects admin routes for a regular user", async () => {
    const agent = request.agent(app);
    await signup(agent, "ada@example.com");
    await login(agent, "ada@example.com");

    const response = await agent.get("/api/users");
    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  it("does not allow an admin to disable themselves via the admin route", async () => {
    const admin = await adminAgent();
    const me = await admin.get("/api/users/me").expect(200);

    const response = await admin.patch(
      `/api/users/${me.body.data.id as string}/disable`,
    );
    expect(response.status).toBe(403);
  });
});
