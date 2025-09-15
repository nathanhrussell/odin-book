const request = require("supertest");

const app = require("../src/app.js");

describe("Auth flow (integration)", () => {
  const user = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: "password123",
  };

  let cookies = null;

  test("register -> login -> access protected /api/auth/me", async () => {
    // register
    const reg = await request(app).post("/api/auth/register").send(user);
    expect(reg.status).toBe(201);

    // login
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    const setCookie = login.headers["set-cookie"];
    expect(setCookie).toBeDefined();

    // use returned cookies to access protected route
    cookies = setCookie.map((c) => c.split(";")[0]).join("; ");

    const me = await request(app).get("/api/auth/me").set("Cookie", cookies);
    expect(me.status).toBe(200);
    expect(me.body).toHaveProperty("user");
    expect(me.body.user).toHaveProperty("id");
    expect(me.body.user.email).toBe(user.email);
  });
});
