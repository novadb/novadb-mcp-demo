import { describe, it, expect, beforeAll } from "vitest";
import { createCmsClient } from "../../../src/cms-api/client.js";
import { createCmsApiClient, BRANCH_ID, validateEnvVars } from "../../setup.js";
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

integrationDescribe("CmsClient (CMS API) - Code Generator", () => {
  let cmsClient: ReturnType<typeof createCmsClient>;
  let ctx: TestFixtureContext;

  beforeAll(async () => {
    const apiClient = createCmsApiClient();
    cmsClient = createCmsClient(apiClient);
    const result = await getTestContext();
    if (!result) throw new Error("Test fixture setup failed — cannot run code generator tests");
    ctx = result;
  });

  describe("getCodeGeneratorTypes", () => {
    it("generates C# code for all types", async () => {
      const response = await cmsClient.getCodeGeneratorTypes(
        String(BRANCH_ID),
        "csharp",
      );

      expect(typeof response.contentType).toBe("string");
      expect(response.body).toBeDefined();

      // Consume the stream to verify it delivers data
      const reader = response.body.getReader();
      let totalBytes = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.length;
      }
      expect(totalBytes).toBeGreaterThan(0);
    });

    it("filters types by IDs", async () => {
      const response = await cmsClient.getCodeGeneratorTypes(
        String(BRANCH_ID),
        "csharp",
        { ids: `${ctx.companyTypeId},${ctx.personTypeId}` },
      );

      expect(typeof response.contentType).toBe("string");
      expect(response.body).toBeDefined();

      // Consume the stream
      const reader = response.body.getReader();
      let totalBytes = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.length;
      }
      expect(totalBytes).toBeGreaterThan(0);
    });
  });

  describe("getCodeGeneratorType", () => {
    it("generates code for a single type", async () => {
      const response = await cmsClient.getCodeGeneratorType(
        String(BRANCH_ID),
        "csharp",
        String(ctx.companyTypeId),
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
    });
  });
});
