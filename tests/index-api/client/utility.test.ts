import { describe, it, expect, beforeAll } from "vitest";
import { createIndexClient } from "../../../src/index-api/client.js";
import { createIndexApiClient, BRANCH_ID, validateEnvVars } from "../../setup.js";

// Check if integration tests should be skipped
let envVarsMissing = false;
try {
  validateEnvVars();
} catch {
  envVarsMissing = true;
}

const integrationDescribe = envVarsMissing ? describe.skip : describe;

integrationDescribe("IndexClient (Index API) - Utility", () => {
  let indexClient: ReturnType<typeof createIndexClient>;

  beforeAll(() => {
    const apiClient = createIndexApiClient();
    indexClient = createIndexClient(apiClient);
  });

  describe("suggestions", () => {
    it("returns suggestions for a pattern", async () => {
      const response = await indexClient.suggestions(String(BRANCH_ID), {
        pattern: "test",
        take: 5,
      });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("workItemOccurrences", () => {
    it("returns work item statistics (global endpoint)", async () => {
      const response = await indexClient.workItemOccurrences();

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("matchStrings", () => {
    it("matches strings against Lucene query", async () => {
      const response = await indexClient.matchStrings({
        query: "test*",
        strings: ["test", "testing", "best"],
      });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });
});
