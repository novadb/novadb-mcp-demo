import { describe, it, expect, beforeAll } from "vitest";
import { createCmsClient } from "../../../src/cms-api/client.js";
import type { CmsObject, CreateObjectsResponse } from "../../../src/cms-api/client.js";
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

integrationDescribe("CmsClient (CMS API) - Objects", () => {
  let cmsClient: ReturnType<typeof createCmsClient>;
  let ctx: TestFixtureContext;
  let createdObjectId: number | undefined;

  beforeAll(async () => {
    const apiClient = createCmsApiClient();
    cmsClient = createCmsClient(apiClient);
    const result = await getTestContext();
    if (!result) throw new Error("Test fixture setup failed — cannot run object tests");
    ctx = result;
  });

  describe("getObject", () => {
    it("fetches an object by ID", async () => {
      const response = await cmsClient.getObject(
        String(BRANCH_ID),
        String(ctx.sampleCompanyId),
      ) as CmsObject;

      expect(response).toBeDefined();
      expect(response.meta).toBeDefined();
      expect(response.meta.id).toBe(ctx.sampleCompanyId);
      expect(response.meta.typeRef).toBe(ctx.companyTypeId);
      expect(response.values).toBeDefined();
    });
  });

  describe("getObjects", () => {
    it("fetches multiple objects by comma-separated IDs", async () => {
      const response = await cmsClient.getObjects(
        String(BRANCH_ID),
        `${ctx.sampleCompanyId},${ctx.samplePersonId}`,
      ) as { objects: CmsObject[] };

      expect(response).toBeDefined();
      expect(response.objects).toBeDefined();
      expect(response.objects.length).toBe(2);

      const ids = response.objects.map((o) => o.meta.id);
      expect(ids).toContain(ctx.sampleCompanyId);
      expect(ids).toContain(ctx.samplePersonId);
    });
  });

  describe("getTypedObjects", () => {
    it("lists objects of a type", async () => {
      const response = await cmsClient.getTypedObjects(
        String(BRANCH_ID),
        String(ctx.companyTypeId),
        { take: 5 },
      ) as { objects: CmsObject[] };

      expect(response).toBeDefined();
      expect(response.objects).toBeDefined();
      expect(response.objects.length).toBeGreaterThanOrEqual(1);

      for (const obj of response.objects) {
        expect(obj.meta.typeRef).toBe(ctx.companyTypeId);
      }
    });

    it("respects pagination parameters", async () => {
      const response = await cmsClient.getTypedObjects(
        String(BRANCH_ID),
        String(ctx.companyTypeId),
        { take: 1 },
      ) as { objects: CmsObject[] };

      expect(response).toBeDefined();
      expect(response.objects).toBeDefined();
      expect(response.objects.length).toBeLessThanOrEqual(1);
    });
  });

  describe("createObjects", () => {
    it("creates a new person object with real attributes", async () => {
      const response = await cmsClient.createObjects(
        String(BRANCH_ID),
        [
          {
            meta: { typeRef: ctx.personTypeId },
            values: [
              {
                attribute: ctx.personAttrIds.vorname,
                language: 0,
                variant: 0,
                value: "Test",
              },
              {
                attribute: ctx.personAttrIds.nachname,
                language: 0,
                variant: 0,
                value: "Person",
              },
              {
                attribute: ctx.personAttrIds.email,
                language: 0,
                variant: 0,
                value: "test@example.com",
              },
            ],
          },
        ],
      ) as CreateObjectsResponse;

      expect(response).toBeDefined();
      expect(response.createdObjectIds).toBeDefined();
      expect(response.createdObjectIds.length).toBe(1);

      createdObjectId = response.createdObjectIds[0];
      expect(createdObjectId).toBeGreaterThan(0);
    });
  });

  describe("updateObjects", () => {
    it("updates an existing object", async () => {
      expect(createdObjectId).toBeDefined();

      const response = await cmsClient.updateObjects(
        String(BRANCH_ID),
        [
          {
            meta: { id: createdObjectId!, typeRef: ctx.personTypeId },
            values: [
              {
                attribute: ctx.personAttrIds.vorname,
                language: 0,
                variant: 0,
                value: "Updated",
              },
            ],
          },
        ],
      ) as { updatedObjects: number };

      expect(response).toBeDefined();
      expect(response.updatedObjects).toBeGreaterThanOrEqual(1);

      // Verify the update took effect
      const updated = await cmsClient.getObject(
        String(BRANCH_ID),
        String(createdObjectId),
      ) as CmsObject;

      const vornameValue = updated.values?.find(
        (v) => v.attribute === ctx.personAttrIds.vorname,
      );
      expect(vornameValue?.value).toBe("Updated");
    });
  });

  describe("deleteObjects", () => {
    it("deletes an object", async () => {
      expect(createdObjectId).toBeDefined();

      const response = await cmsClient.deleteObjects(String(BRANCH_ID), [
        String(createdObjectId),
      ]);

      expect(response).toBeDefined();
    });
  });
});
