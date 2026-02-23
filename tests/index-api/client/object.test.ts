import { describe, it, expect, beforeAll } from "vitest";
import { createIndexClient } from "../../../src/index-api/client.js";
import { createIndexApiClient, BRANCH_ID, validateEnvVars } from "../../setup.js";
import { getTestContext } from "../../fixtures/test-context.js";
import type { TestFixtureContext } from "../../fixtures/setup-types.js";

// Check if integration tests should be skipped
let envVarsMissing = false;
try {
  validateEnvVars();
} catch {
  envVarsMissing = true;
}

const integrationDescribe = envVarsMissing ? describe.skip : describe;

integrationDescribe("IndexClient (Index API) - Objects", () => {
  let indexClient: ReturnType<typeof createIndexClient>;
  let ctx: TestFixtureContext;

  beforeAll(async () => {
    const apiClient = createIndexApiClient();
    indexClient = createIndexClient(apiClient);
    const result = await getTestContext();
    if (!result) throw new Error("Test fixture setup failed — cannot run index object tests");
    ctx = result;
  });

  describe("searchObjects", () => {
    it("returns paginated list of objects", async () => {
      const response = await indexClient.searchObjects(String(BRANCH_ID), {
        take: 5,
      });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("countObjects", () => {
    it("returns object count", async () => {
      const response = await indexClient.countObjects(String(BRANCH_ID));

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("objectOccurrences", () => {
    it("returns object type facets", async () => {
      const response = await indexClient.objectOccurrences(
        String(BRANCH_ID),
        { getTypeOccurrences: true },
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("objectXmlLinkCount", () => {
    it("counts XML links for sample object", async () => {
      const response = await indexClient.objectXmlLinkCount(
        String(BRANCH_ID),
        { objectIds: [ctx.sampleCompanyId] },
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("Complex object filter scenarios", () => {
    it("filters by MCP-Company object type", async () => {
      const response = await indexClient.searchObjects(String(BRANCH_ID), {
        filter: {
          objectTypeIds: [ctx.companyTypeId],
          hasDisplayName: true,
          deleted: false,
        },
        take: 5,
      });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });

    it("searches for MCP-Person objects by ID filter", async () => {
      const response = await indexClient.searchObjects(String(BRANCH_ID), {
        filter: {
          objectTypeIds: [ctx.personTypeId],
          objectIds: [ctx.samplePersonId],
        },
        take: 5,
      });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });
});
