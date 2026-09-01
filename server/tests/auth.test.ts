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
});

describe("GET /api/users/me", () => {
  it("requires a session", async () => {
    const response = await request(app).get("/api/users/me");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});
