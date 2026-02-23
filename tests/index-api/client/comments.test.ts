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

integrationDescribe("IndexClient (Index API) - Comments", () => {
  let indexClient: ReturnType<typeof createIndexClient>;

  beforeAll(() => {
    const apiClient = createIndexApiClient();
    indexClient = createIndexClient(apiClient);
  });

  describe("searchComments", () => {
    it("returns comments from branch", async () => {
      const response = await indexClient.searchComments(String(BRANCH_ID), {
        take: 5,
      });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("countComments", () => {
    it("returns total comment count", async () => {
      const response = await indexClient.countComments(String(BRANCH_ID));

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("commentOccurrences", () => {
    it("returns user facets for comments", async () => {
      const response = await indexClient.commentOccurrences(
        String(BRANCH_ID),
        { getUserOccurrences: true },
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });
});
