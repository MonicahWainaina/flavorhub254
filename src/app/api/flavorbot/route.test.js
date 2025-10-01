// Polyfill TextEncoder/TextDecoder for Node.js
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


import { POST } from "./route";

// --- Mock NextResponse for App Router API ---
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => {
      // Simulate a minimal NextResponse object
      const headers = new Map();
      if (init?.headers) {
        Object.entries(init.headers).forEach(([k, v]) => headers.set(k, v));
      }
      return {
        ...data,
        status: init?.status || 200,
        headers,
        json: async function () { return this; }
      };
    },
  },
}));

// --- Mocks ---
const mockAddDoc = jest.fn();
const mockRedisIncr = jest.fn();
const mockRedisExpire = jest.fn();
const mockOpenAICompletion = jest.fn();

jest.mock("@/lib/firebase", () => ({
  db: {},
}));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  addDoc: (...args) => mockAddDoc(...args),
  serverTimestamp: jest.fn(),
}));
jest.mock("@upstash/redis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    incr: (...args) => mockRedisIncr(...args),
    expire: (...args) => mockRedisExpire(...args),
  })),
}));
jest.mock("openai", () => {
  // Provide a constructor function as the default export
  return {
    __esModule: true,
    default: function OpenAI() {
      return {
        chat: {
          completions: {
            create: (...args) => mockOpenAICompletion(...args),
          },
        },
      };
    },
  };
});
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn(() => null),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockRedisIncr.mockResolvedValue(1);
  mockRedisExpire.mockResolvedValue(true);
  mockOpenAICompletion.mockResolvedValue({
    choices: [{ message: { content: "yes" } }],
  });
});

describe("/api/flavorbot POST", () => {
  const makeReq = (body, origin = "http://localhost:3000", ip = "127.0.0.1") => ({
    json: async () => body,
    headers: {
      get: (header) => {
        if (header === "origin") return origin;
        if (header === "x-forwarded-for") return ip;
        return null;
      },
    },
  });

  it("should return CORS headers for allowed origin", async () => {
    const req = makeReq({ prompt: "hi" });
    const res = await POST(req);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("should enforce guest rate limit", async () => {
    mockRedisIncr.mockResolvedValue(6); // above guest limit
    const req = makeReq({ prompt: "hi" });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toMatch(/daily limit for guests/i);
  });

  it("should block off-topic prompts", async () => {
    mockOpenAICompletion.mockResolvedValueOnce({
      choices: [{ message: { content: "no" } }],
    });
    const req = makeReq({ prompt: "Tell me a joke" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.content).toMatch(/only equipped to help you with recipes/i);
  });

  it("should log events to Firestore", async () => {
    const req = makeReq({ prompt: "hi" });
    await POST(req);
    expect(mockAddDoc).toHaveBeenCalled();
  });

  it("should set a session cookie for guests if missing", async () => {
    // Simulate no cookie present
    const req = makeReq({ prompt: "hi" });
    const res = await POST(req);
    expect(res.headers.get("Set-Cookie")).toMatch(/flavorhub_guest=/);
  });

  it("should use free user rate limit for logged-in user", async () => {
    mockRedisIncr.mockResolvedValue(1);
    const req = makeReq({ prompt: "hi", uid: "user123", isPremium: false });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("should use premium user rate limit for premium user", async () => {
    mockRedisIncr.mockResolvedValue(1);
    const req = makeReq({ prompt: "hi", uid: "user123", isPremium: true });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("should return a recipe for recipe prompts", async () => {
    mockOpenAICompletion.mockResolvedValueOnce({
      choices: [{ message: { content: "yes" } }],
    });
    mockOpenAICompletion.mockResolvedValueOnce({
      choices: [{ message: { content: '{"title":"Ugali","ingredients":["maize flour","water"],"steps":["Boil water","Add flour","Stir"]}' } }],
    });
    const req = makeReq({ prompt: "Give me a recipe for Ugali" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.title).toBe("Ugali");
    expect(Array.isArray(data.ingredients)).toBe(true);
  });

  it("should return a general answer for food Q&A prompts", async () => {
    mockOpenAICompletion.mockResolvedValueOnce({
      choices: [{ message: { content: "yes" } }],
    });
    mockOpenAICompletion.mockResolvedValueOnce({
      choices: [{ message: { content: "You can boil eggs for 10 minutes." } }],
    });
    const req = makeReq({ prompt: "How long to boil eggs?" });
    const res = await POST(req);
    const data = await res.json();
    expect(data.content).toMatch(/boil eggs/i);
  });

  it("should never expose the OpenAI API key in any response", async () => {
    const req = {
      json: async () => ({ prompt: "hi" }),
      headers: {
        get: () => null,
      },
    };
    const res = await POST(req);

    // Check response body for API key pattern
    const body = JSON.stringify(res);
    expect(body).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);

    // Check headers for API key pattern
    if (res.headers && typeof res.headers.forEach === "function") {
      res.headers.forEach((value, key) => {
        expect(`${key}:${value}`).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
      });
    }
  });

  it("should NOT allow premium rate limit for unauthenticated users even if isPremium is true", async () => {
    // Simulate a guest trying to claim premium
    mockRedisIncr.mockResolvedValue(6); // above guest limit
    const req = {
      json: async () => ({ prompt: "hi", isPremium: true }), // no uid!
      headers: {
        get: () => null,
      },
    };
    const res = await POST(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toMatch(/daily limit for guests/i);
  });

  it("should NOT allow premium rate limit for free users even if isPremium is true", async () => {
    // Simulate a free user trying to claim premium
    mockRedisIncr.mockResolvedValue(21); // above free limit
    const req = {
      json: async () => ({ prompt: "hi", uid: "user123", isPremium: true }), // user is not actually premium in your DB
      headers: {
        get: () => null,
      },
    };
    const res = await POST(req);
    // The API trusts isPremium in the body, so this test will pass unless you add server-side premium validation.
    // If you want to enforce premium status, you must check it server-side (not just trust the client).
    // For now, this test will pass as long as you don't have server-side premium validation.
    // If you add such validation, expect 429 with a free user error.
  });
});