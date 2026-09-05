import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { passwordLogin, registerUser } from "./auth-helpers.js";

const app = createApp();

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
    await registerUser(agent, "ada@example.com");
    await passwordLogin(agent, "ada@example.com");

    const me = await agent.get("/api/users/me");
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe("ada@example.com");
    expect(me.body.data.name).toBe("Ada Lovelace");
    expect(me.body.data.storageLimitBytes).toBe(500 * 1024 * 1024);
  });

  it("does not issue a register code for an existing email", async () => {
    const agent = request.agent(app);
    await registerUser(agent, "ada@example.com");

    const otp = await request(app)
      .post("/api/auth/otp")
      .send({ email: "ada@example.com", action: "register" });

    expect(otp.status).toBe(409);
    expect(otp.body.code).toBe("EMAIL_TAKEN");
  });

  it("rejects a wrong password before sending a login code", async () => {
    const agent = request.agent(app);
    await registerUser(agent, "ada@example.com");

    const otp = await request(app).post("/api/auth/otp").send({
      email: "ada@example.com",
      action: "login",
      password: "wrong-pass",
    });

    expect(otp.status).toBe(401);
    expect(otp.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("clears the session on logout", async () => {
    const agent = request.agent(app);
    await registerUser(agent, "ada@example.com");
    await passwordLogin(agent, "ada@example.com");

    await agent.post("/api/auth/logout").expect(200);

    const me = await agent.get("/api/users/me");
    expect(me.status).toBe(401);
  });

  it("resets a password with a verification code", async () => {
    const agent = request.agent(app);
    await registerUser(agent, "ada@example.com");
    await passwordLogin(agent, "ada@example.com");

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

    await passwordLogin(request.agent(app), "ada@example.com", "password2");
  });

  it("rejects forgot password when the email has no account", async () => {
    const response = await request(app)
      .post("/api/auth/password/forgot")
      .send({ email: "noregisteruser@gmail.com" });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ACCOUNT_NOT_FOUND");
  });

  it("signs out every session", async () => {
    const agent = request.agent(app);
    await registerUser(agent, "ada@example.com");
    await passwordLogin(agent, "ada@example.com");

    const other = request.agent(app);
    await passwordLogin(other, "ada@example.com");

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
    await registerUser(agent, email);

    const me = await agent.get("/api/users/me").expect(200);
    expect(me.body.data.isGuest).toBe(false);
    expect(me.body.data.email).toBe(email);
    expect(me.body.data.hasPassword).toBe(true);
    expect(me.body.data.storageLimitBytes).toBe(500 * 1024 * 1024);
    expect(me.body.data.rootDirId).toBe(rootDirId);

    const listing = await agent.get("/api/directories").expect(200);
    expect(listing.body.data.files.items[0].name).toBe("notes.txt");

    await agent.post("/api/auth/logout").expect(200);
    await passwordLogin(agent, email);
    const again = await agent.get("/api/users/me").expect(200);
    expect(again.body.data.rootDirId).toBe(rootDirId);
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

describe("auth flows", () => {
  it("does not create a user until the register code is verified", async () => {
    const email = "pending@example.com";
    await request(app)
      .post("/api/auth/otp")
      .send({ email, action: "register" })
      .expect(200);

    const forgot = await request(app)
      .post("/api/auth/password/forgot")
      .send({ email });
    expect(forgot.status).toBe(404);
    expect(forgot.body.code).toBe("ACCOUNT_NOT_FOUND");

    const login = await request(app).post("/api/auth/otp").send({
      email,
      action: "login",
      password: "password1",
    });
    expect(login.status).toBe(401);
    expect(login.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects register with a wrong or missing code", async () => {
    const email = "otp-wrong@example.com";
    await request(app)
      .post("/api/auth/otp")
      .send({ email, action: "register" })
      .expect(200);

    const wrong = await request(app).post("/api/auth/register").send({
      name: "Ada Lovelace",
      email,
      password: "password1",
      code: "0000",
    });
    expect(wrong.status).toBe(400);
    expect(wrong.body.code).toBe("INVALID_CODE");

    const missing = await request(app).post("/api/auth/register").send({
      name: "Ada Lovelace",
      email: "never-requested@example.com",
      password: "password1",
      code: "1234",
    });
    expect(missing.status).toBe(400);
    expect(missing.body.code).toBe("INVALID_CODE");
  });

  it("invalidates the old register code when a new one is sent", async () => {
    const email = "otp-resend@example.com";
    const first = await request(app)
      .post("/api/auth/otp")
      .send({ email, action: "register" })
      .expect(200);
    const oldCode = first.body.data.code as string;

    const second = await request(app)
      .post("/api/auth/otp")
      .send({ email, action: "register" })
      .expect(200);
    const newCode = second.body.data.code as string;
    expect(newCode).toMatch(/^\d{4}$/);

    const stale = await request(app).post("/api/auth/register").send({
      name: "Ada Lovelace",
      email,
      password: "password1",
      code: oldCode,
    });
    expect(stale.status).toBe(400);
    expect(stale.body.code).toBe("INVALID_CODE");

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Ada Lovelace",
        email,
        password: "password1",
        code: newCode,
      })
      .expect(201);
  });

  it("rejects a consumed register code on login", async () => {
    const email = "purpose-mix@example.com";
    const signup = await request(app)
      .post("/api/auth/otp")
      .send({ email, action: "register" })
      .expect(200);

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Ada Lovelace",
        email,
        password: "password1",
        code: signup.body.data.code,
      })
      .expect(201);

    const loginOtp = await request(app)
      .post("/api/auth/otp")
      .send({ email, action: "login", password: "password1" })
      .expect(200);

    const mixed = await request(app).post("/api/auth/login").send({
      email,
      password: "password1",
      code: signup.body.data.code,
    });
    expect(mixed.status).toBe(400);
    expect(mixed.body.code).toBe("INVALID_CODE");

    await request
      .agent(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "password1",
        code: loginOtp.body.data.code,
      })
      .expect(200);
  });

  it("rejects login for an unknown email", async () => {
    const response = await request(app).post("/api/auth/otp").send({
      email: "nobody@example.com",
      action: "login",
      password: "password1",
    });
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a wrong login code after a valid password", async () => {
    const agent = request.agent(app);
    await registerUser(agent, "ada@example.com");

    await request(app)
      .post("/api/auth/otp")
      .send({
        email: "ada@example.com",
        action: "login",
        password: "password1",
      })
      .expect(200);

    const response = await request(app).post("/api/auth/login").send({
      email: "ada@example.com",
      password: "password1",
      code: "0000",
    });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_CODE");
  });

  it("rejects a reset with a wrong code", async () => {
    const agent = request.agent(app);
    await registerUser(agent, "ada@example.com");

    await request(app)
      .post("/api/auth/password/forgot")
      .send({ email: "ada@example.com" })
      .expect(200);

    const response = await request(app).post("/api/auth/password/reset").send({
      email: "ada@example.com",
      code: "0000",
      password: "password2",
    });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("INVALID_CODE");
  });

  it("rejects forgot password for a guest account", async () => {
    const guest = await request(app).post("/api/auth/guest").expect(200);
    const email = guest.body.data.email as string;

    const response = await request(app)
      .post("/api/auth/password/forgot")
      .send({ email });
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ACCOUNT_NOT_FOUND");
  });

  it("rejects login without a password on the otp request", async () => {
    const response = await request(app).post("/api/auth/otp").send({
      email: "ada@example.com",
      action: "login",
    });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/users/me", () => {
  it("requires a session", async () => {
    const response = await request(app).get("/api/users/me");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHENTICATED");
  });
});
