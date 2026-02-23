import { describe, it, expect, beforeAll } from "vitest";
import { createCmsClient } from "../../../src/cms-api/client.js";
import type { CmsObject } from "../../../src/cms-api/client.js";
import { createCmsApiClient, BRANCH_ID, validateEnvVars } from "../../setup.js";

// Check if integration tests should be skipped
let envVarsMissing = false;
try {
  validateEnvVars();
} catch {
  envVarsMissing = true;
}

const integrationDescribe = envVarsMissing ? describe.skip : describe;

integrationDescribe("CmsClient (CMS API) - Branches", () => {
  let cmsClient: ReturnType<typeof createCmsClient>;
  let createdBranchId: number | undefined;

  beforeAll(() => {
    const apiClient = createCmsApiClient();
    cmsClient = createCmsClient(apiClient);
  });

  describe("getBranch", () => {
    it("fetches a branch by ID", async () => {
      const response = await cmsClient.getBranch(String(BRANCH_ID)) as CmsObject;

      expect(response).toBeDefined();
      expect(response.meta).toBeDefined();
      expect(response.meta.id).toBe(BRANCH_ID);
    });

    it("respects attribute filtering", async () => {
      const response = await cmsClient.getBranch(String(BRANCH_ID), {
        attributes: "1000",
      }) as CmsObject;

      expect(response).toBeDefined();
      expect(response.meta).toBeDefined();
      expect(response.values).toBeDefined();
    });
  });

  describe("createBranch", () => {
    it("creates a new branch", async () => {
      const response = await cmsClient.createBranch(
        [
          { attribute: 1000, language: 201, variant: 0, value: "MCP Test Branch" },
          { attribute: 4000, language: 0, variant: 0, value: BRANCH_ID }, // parent branch
        ],
        {
          comment: "Test branch creation",
          username: "test",
        },
      ) as CmsObject;

      expect(response).toBeDefined();
      expect(response.meta).toBeDefined();
      expect(response.meta.id).toBeGreaterThan(0);

      createdBranchId = response.meta.id;
    });
  });

  describe("updateBranch", () => {
    it("updates an existing branch", async () => {
      expect(createdBranchId).toBeDefined();

      const response = await cmsClient.updateBranch(
        String(createdBranchId),
        [
          { attribute: 1000, language: 201, variant: 0, value: "MCP Test Branch Updated" },
        ],
        {
          comment: "Test branch update",
          username: "test",
        },
      );

      expect(response).toBeDefined();
    });
  });

  describe("deleteBranch", () => {
    it("deletes a branch", async () => {
      expect(createdBranchId).toBeDefined();

      const response = await cmsClient.deleteBranch(String(createdBranchId), {
        comment: "Test branch deletion",
      });

      expect(response).toBeDefined();
    });
  });
});
