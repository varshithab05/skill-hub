// Test file for job routes
const request = require("supertest");
const sinon = require("sinon");
const mongoose = require("mongoose");
const { app } = require("../index");

describe("GET /jobs/marketplace", () => {
  it("should get all marketplace jobs", async () => {
    // Test the marketplace endpoint which we know exists
    const response = await request(app).get("/jobs/marketplace");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
