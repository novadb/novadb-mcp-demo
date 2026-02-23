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

integrationDescribe("CmsClient (CMS API) - Comments", () => {
  let cmsClient: ReturnType<typeof createCmsClient>;
  let ctx: TestFixtureContext;
  let createdCommentId: string | undefined;

  beforeAll(async () => {
    const apiClient = createCmsApiClient();
    cmsClient = createCmsClient(apiClient);
    const result = await getTestContext();
    if (!result) throw new Error("Test fixture setup failed — cannot run comment tests");
    ctx = result;
  });

  describe("getComments", () => {
    it("fetches all comments with pagination", async () => {
      const response = await cmsClient.getComments({ take: 5 });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });

    it("filters comments by branch", async () => {
      const response = await cmsClient.getComments({
        branchRef: BRANCH_ID,
        take: 5,
      });

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("createComment", () => {
    it("creates a new comment on a sample object", async () => {
      const response = await cmsClient.createComment(
        BRANCH_ID,
        ctx.sampleCompanyId,
        "<div>Test comment body from MCP integration test</div>",
        { username: "test" },
      ) as Record<string, unknown>;

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");

      // Store the comment ID for subsequent tests
      createdCommentId = String(response.id);
      expect(response.id).toBeDefined();
    });
  });

  describe("getComment", () => {
    it("fetches the created comment by ID", async () => {
      expect(createdCommentId).toBeDefined();

      const response = await cmsClient.getComment(createdCommentId!);

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("updateComment", () => {
    it("updates an existing comment", async () => {
      expect(createdCommentId).toBeDefined();

      const response = await cmsClient.updateComment(
        createdCommentId!,
        "<div>Updated comment body</div>",
        { username: "test" },
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("deleteComment", () => {
    it("deletes a comment", async () => {
      expect(createdCommentId).toBeDefined();

      const response = await cmsClient.deleteComment(createdCommentId!, {
        username: "test",
      });

      expect(response).toBeDefined();
    });
  });
});
