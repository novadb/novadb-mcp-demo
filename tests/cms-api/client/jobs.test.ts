import { describe, it, expect, beforeAll } from "vitest";
import { createCmsClient } from "../../../src/cms-api/client.js";
import { createCmsApiClient, BRANCH_ID, validateEnvVars } from "../../setup.js";

// Check if integration tests should be skipped
let envVarsMissing = false;
try {
  validateEnvVars();
} catch {
  envVarsMissing = true;
}

const integrationDescribe = envVarsMissing ? describe.skip : describe;

integrationDescribe("CmsClient (CMS API) - Jobs", () => {
  let cmsClient: ReturnType<typeof createCmsClient>;

  beforeAll(() => {
    const apiClient = createCmsApiClient();
    cmsClient = createCmsClient(apiClient);
  });

  describe("getJobs", () => {
    it("lists jobs for a branch", async () => {
      const response = await cmsClient.getJobs(BRANCH_ID, { take: 5 });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });

    it("filters jobs by state", async () => {
      const response = await cmsClient.getJobs(BRANCH_ID, {
        state: 2, // Succeeded
        take: 5,
      });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("Job Input", () => {
    let inputToken: string | undefined;

    it("uploads a job input file", async () => {
      const blob = new Blob(["test job input content"]);
      const response = await cmsClient.jobInputUpload(blob, "test-input.txt") as Record<string, unknown>;

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");

      inputToken = response.token as string | undefined;
      expect(inputToken).toBeDefined();
    });

    it("cancels a job input upload", async () => {
      expect(inputToken).toBeDefined();

      const response = await cmsClient.jobInputCancel(inputToken!);
      expect(response).toBeDefined();
    });
  });
});
