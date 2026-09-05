import request from "supertest";
import type { Express } from "express";

const defaultPassword = "password1";

export async function registerUser(
  agent: ReturnType<typeof request.agent>,
  email: string,
  password = defaultPassword,
  name = "Ada Lovelace",
) {
  const otp = await agent
    .post("/api/auth/otp")
    .send({ email, action: "register" })
    .expect(200);

  await agent
    .post("/api/auth/register")
    .send({
      name,
      email,
      password,
      code: otp.body.data.code,
    })
    .expect(201);
}

export async function passwordLogin(
  agent: ReturnType<typeof request.agent>,
  email: string,
  password = defaultPassword,
) {
  const otp = await agent
    .post("/api/auth/otp")
    .send({ email, action: "login", password })
    .expect(200);

  await agent
    .post("/api/auth/login")
    .send({ email, password, code: otp.body.data.code })
    .expect(200);
}

export async function signedInAgent(
  app: Express,
  email = "ada@example.com",
  password = defaultPassword,
) {
  const agent = request.agent(app);
  await registerUser(agent, email, password);
  await passwordLogin(agent, email, password);
  return agent;
}
