// Test file for marketplace routes
const request = require("supertest");
const { app } = require("../index");

describe("GET /jobs/marketplace", () => {
  it("should return an array of jobs", async () => {
    const response = await request(app).get("/jobs/marketplace");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
