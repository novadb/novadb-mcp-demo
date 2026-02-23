import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "../src/http-client.js";
import { createIndexApiClient, BRANCH_ID, validateEnvVars } from "./setup.js";

// Check if integration tests should be skipped
let envVarsMissing = false;
try {
  validateEnvVars();
  // Also verify NOVA_HOST is a valid URL
  const host = process.env.NOVA_HOST!.replace(/\/+$/, "");
  new URL(`${host}/apis/index/v1/test`);
} catch {
  envVarsMissing = true;
}

describe("ApiClient", () => {
  describe("buildUrl (static unit tests)", () => {
    const client = new ApiClient({
      baseUrl: "https://example.com/api",
      user: "test",
      password: "password",
    });

    it("builds URL with just path", () => {
      const url = client.buildUrl("/objects");
      expect(url).toBe("https://example.com/api/objects");
    });

    it("appends query parameters to URL", () => {
      const url = client.buildUrl("/objects", { skip: 10, take: 5 });
      expect(url).toContain("skip=10");
      expect(url).toContain("take=5");
    });

    it("skips undefined parameters", () => {
      const url = client.buildUrl("/search", {
        query: "test",
        filter: undefined,
      });
      expect(url).toContain("query=test");
      expect(url).not.toContain("filter");
    });

    it("skips null parameters", () => {
      const url = client.buildUrl("/search", {
        query: "test",
        filter: null,
      });
      expect(url).toContain("query=test");
      expect(url).not.toContain("filter");
    });

    it("skips empty string parameters", () => {
      const url = client.buildUrl("/search", {
        query: "test",
        filter: "",
      });
      expect(url).toContain("query=test");
      expect(url).not.toContain("filter");
    });

    it("converts number parameters to strings", () => {
      const url = client.buildUrl("/objects", { id: 12345 });
      expect(url).toContain("id=12345");
    });

    it("converts boolean parameters to strings", () => {
      const url = client.buildUrl("/search", { deleted: true });
      expect(url).toContain("deleted=true");
    });

    it("handles multiple slashes in path", () => {
      const url = client.buildUrl("/cms/branches/123");
      expect(url).toBe("https://example.com/api/cms/branches/123");
    });

    it("encodes special characters in parameters", () => {
      const url = client.buildUrl("/search", { query: "test & special" });
      // Special characters like & should be properly encoded in query string
      expect(url).toContain("query=test");
      expect(url).toContain("special");
      expect(url).toContain("%26"); // & should be encoded as %26
      // URL should be valid after encoding
      expect(() => new URL(url)).not.toThrow();
    });
  });


  const integrationDescribe = envVarsMissing ? describe.skip : describe;

  integrationDescribe("Integration Tests (requires NOVA_* env vars)", () => {
    let client: ApiClient;

    beforeAll(() => {
      client = createIndexApiClient();
    });

    it("successfully performs POST request with filter to real API", async () => {
      // Use the objects search endpoint to verify connectivity
      const response = await client.post(`/branches/${BRANCH_ID}/objects`, {
        filter: {},
        page: { skip: 0, take: 1 },
      });
      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
      expect(response).not.toBeNull();
    });

    it("handles non-existent branch gracefully", async () => {
      // API returns empty results for non-existent branch, not an error
      const response = await client.post(`/branches/999999999/objects`, {
        filter: {},
        page: { skip: 0, take: 1 },
      });
      expect(response).toBeDefined();
      // Non-existent branch returns empty results
      expect(typeof response).toBe("object");
    });

    it("throws error on invalid authentication", async () => {
      // Create a client with wrong password
      const badClient = new ApiClient({
        baseUrl: `${process.env.NOVA_HOST}/apis/index/v1`,
        user: process.env.NOVA_INDEX_USER!,
        password: "wrong_password_xyz",
      });

      // Invalid credentials should result in 401 Unauthorized or 403 Forbidden
      await expect(badClient.get(`/branches/${BRANCH_ID}`)).rejects.toThrow(
        /HTTP (401|403)/
      );
    });

    it("handles multiple consecutive POST requests", async () => {
      // Verify that multiple requests work correctly in sequence
      const response1 = await client.post(`/branches/${BRANCH_ID}/objects`, {
        filter: {},
        page: { skip: 0, take: 1 },
      });
      const response2 = await client.post(`/branches/${BRANCH_ID}/objects`, {
        filter: {},
        page: { skip: 0, take: 1 },
      });

      expect(response1).toBeDefined();
      expect(response2).toBeDefined();
    });
  });
});
