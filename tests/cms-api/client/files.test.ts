import { describe, it, expect, beforeAll } from "vitest";
import { createCmsClient } from "../../../src/cms-api/client.js";
import { createCmsApiClient, validateEnvVars } from "../../setup.js";

// Check if integration tests should be skipped
let envVarsMissing = false;
try {
  validateEnvVars();
} catch {
  envVarsMissing = true;
}

const integrationDescribe = envVarsMissing ? describe.skip : describe;

integrationDescribe("CmsClient (CMS API) - Files", () => {
  let cmsClient: ReturnType<typeof createCmsClient>;
  let uploadToken: string | undefined;

  beforeAll(() => {
    const apiClient = createCmsApiClient();
    cmsClient = createCmsClient(apiClient);
  });

  describe("fileUploadStart", () => {
    it("starts a file upload (no commit)", async () => {
      const blob = new Blob(["test file content"]);
      const response = await cmsClient.fileUploadStart(
        blob,
        "test.jpg",
        ".jpg",
        false,
      ) as Record<string, unknown>;

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");

      uploadToken = response.token as string | undefined;
      expect(uploadToken).toBeDefined();
    });

    it("uploads and commits a file in a single chunk", async () => {
      const blob = new Blob(["complete file"]);
      const response = await cmsClient.fileUploadStart(
        blob,
        "complete.jpg",
        ".jpg",
        true,
      ) as Record<string, unknown>;

      expect(response).toBeDefined();
      expect(response.guid).toBeDefined();
    });
  });

  describe("fileUploadContinue", () => {
    it("continues a chunked upload and commits", async () => {
      expect(uploadToken).toBeDefined();

      const blob = new Blob(["final chunk"]);
      const response = await cmsClient.fileUploadContinue(
        blob,
        "test.jpg",
        ".jpg",
        true,
        uploadToken!,
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");
    });
  });

  describe("getFile", () => {
    it("downloads a file and returns contentType and a readable body stream", async () => {
      // First upload a file to ensure one exists
      const content = "hello from getFile test";
      const blob = new Blob([content]);
      const ext = ".txt";
      const uploadResponse = await cmsClient.fileUploadStart(
        blob,
        "get-file-test.txt",
        ext,
        true,
      ) as Record<string, unknown>;

      // Committed uploads return guid or fileIdentifier
      const fileId = (uploadResponse.fileIdentifier ?? uploadResponse.guid) as string;
      expect(fileId).toBeDefined();

      // The file name is the fileIdentifier (hash) with extension
      const fileName = fileId.includes(".") ? fileId : `${fileId}${ext}`;
      const result = await cmsClient.getFile(fileName);
      expect(typeof result.contentType).toBe("string");
      expect(result.body).toBeDefined();

      // Consume the stream to verify it delivers data
      const chunks: Uint8Array[] = [];
      const reader = result.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const totalBytes = chunks.reduce((sum, c) => sum + c.length, 0);
      expect(totalBytes).toBeGreaterThan(0);
    });
  });

  describe("fileUploadCancel", () => {
    it("starts and cancels a file upload", async () => {
      const blob = new Blob(["to be cancelled"]);
      const startResponse = await cmsClient.fileUploadStart(
        blob,
        "cancel-me.jpg",
        ".jpg",
        false,
      ) as Record<string, unknown>;

      const cancelToken = startResponse.token as string;
      expect(cancelToken).toBeDefined();

      const response = await cmsClient.fileUploadCancel(cancelToken);
      expect(response).toBeDefined();
    });
  });
});
