import request from "supertest";
import app from "../app";
import { Pool } from "pg";

describe("app starts", () => {
  it("should respond", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    await process.nextTick(() => {});
  });
});

describe("upload employee salaries file ", () => {
  beforeAll(async () => {
    //clear the database
    const pool = new Pool({
      user: "postgres",
      host: "localhost",
      database: "esm-db",
      password: "P@ssw0rd123!",
      port: 5432,
    });
    await pool.query("DELETE FROM employees;");
    await pool.end();
    await process.nextTick(() => {});
  });
  afterAll(async () => {
    const pool = new Pool({
      user: "postgres",
      host: "localhost",
      database: "esm-db",
      password: "P@ssw0rd123!",
      port: 5432,
    });
    await pool.query("DELETE FROM employees;");
    await pool.end();
    await process.nextTick(() => {});
  });
  test("should insert employee salaries from file while ignoring row with '#'", async () => {
    const res = await request(app)
      .post("/users/upload")
      .attach("file", `${__dirname}/test1.csv`);
    expect(res.status).toEqual(200);
    await process.nextTick(() => {});
  });

  test("should throw error as upload attempts to insert duplicate login id", async () => {
    const res = await request(app)
      .post("/users/upload")
      .attach("file", `${__dirname}/test2.csv`);
    expect(res.status).toEqual(400);
    await process.nextTick(() => {});
  });
});
