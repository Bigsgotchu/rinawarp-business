import http from "http";
import express from "express";
import request from "supertest";
import type { Server } from "http";
import { AddressInfo } from "net";

// Import your configured app (not .listen) to avoid binding ports in tests
import app from "../src/app";

let server: Server;
let base: string;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(0, () => {
    const addr = server.address() as AddressInfo;
    base = `http://127.0.0.1:${addr.port}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

describe("health", () => {
  it("GET /health -> ok", async () => {
    const res = await request(base).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("models", () => {
  it("GET /v1/models -> contains rina-agent", async () => {
    const res = await request(base).get("/v1/models");
    expect(res.status).toBe(200);
    expect(res.body.object).toBe("list");
    const ids = (res.body.data || []).map((m: any) => m.id);
    expect(ids).toContain("rina-agent");
  });
});

describe("chat completions", () => {
  const validBody = {
    model: "rina-agent",
    messages: [{ role: "user", content: "ping" }]
  };

  it("POST /v1/chat/completions -> non-stream JSON", async () => {
    const res = await request(base)
      .post("/v1/chat/completions")
      .set("content-type", "application/json")
      .send(validBody);
    expect(res.status).toBe(200);
    expect(res.body.object).toBe("chat.completion");
    expect(res.body.choices?.[0]?.message?.role).toBe("assistant");
    expect(typeof res.body.choices?.[0]?.message?.content).toBe("string");
  });

  it("POST /v1/chat/completions -> stream SSE", async () => {
    const res = await request(base)
      .post("/v1/chat/completions")
      .set("accept", "text/event-stream")
      .set("content-type", "application/json")
      .send({ ...validBody, stream: true });

    // supertest buffers; validate framing quickly
    expect(res.status).toBe(200);
    const text = res.text;
    expect(text).toContain('"object":"chat.completion.chunk"');
    expect(text).toContain("[DONE]");
  });

  it("POST /v1/chat/completions -> 400 invalid model", async () => {
    const res = await request(base)
      .post("/v1/chat/completions")
      .set("content-type", "application/json")
      .send({ ...validBody, model: "nope" });
    expect(res.status).toBe(400);
    expect(res.body.error?.code).toBe("bad_request");
  });

  it("POST /v1/chat/completions -> 400 invalid messages", async () => {
    const res = await request(base)
      .post("/v1/chat/completions")
      .set("content-type", "application/json")
      .send({ model: "rina-agent", messages: "not-an-array" });
    expect(res.status).toBe(400);
  });

  it("POST /v1/chat/completions -> 415 when not JSON", async () => {
    const res = await request(base)
      .post("/v1/chat/completions")
      .set("content-type", "text/plain")
      .send("hello");
    expect([400, 415]).toContain(res.status); // allow either if your guard maps to 415
  });
});
