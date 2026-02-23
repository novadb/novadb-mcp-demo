import type { CmsClient, CmsObject } from "../../src/cms-api/client.js";
import { extractMultiValueObjRef, extractFormFields } from "./helpers.js";
import {
  ATTR_NAME,
  ATTR_OBJ_TYPE_CREATE_FORM,
  ATTR_OBJ_TYPE_DETAIL_FORMS,
  LANG_EN,
  TYPE_REF_OBJECT_TYPE,
  TYPE_REF_FORM,
  TYPE_REF_APP_AREA,
} from "./constants.js";

function getStringValue(obj: CmsObject, attrId: number, langId: number): string | undefined {
  return obj.values?.find(
    (v) => v.attribute === attrId && v.language === langId,
  )?.value as string | undefined;
}

/**
 * Finds and deletes all existing MCP-* test types, their attributes,
 * forms, app areas, and object instances.
 *
 * Uses the CMS API directly (getTypedObjects) instead of the Index API
 * to avoid eventual-consistency issues where the index hasn't caught up yet.
 *
 * Deletion order: instances -> app areas -> forms -> types -> attributes
 */
export async function cleanupMcpTypes(
  cms: CmsClient,
  branch: string,
): Promise<void> {
  // Step 1: Find existing MCP-* object types via CMS API
  const typeResults = await cms.getTypedObjects(branch, String(TYPE_REF_OBJECT_TYPE), {
    take: 100,
    attributes: String(ATTR_NAME),
    languages: String(LANG_EN),
  }) as { objects?: CmsObject[] };

  const mcpTypes = (typeResults.objects ?? []).filter((o) => {
    const name = getStringValue(o, ATTR_NAME, LANG_EN);
    return name?.startsWith("MCP-");
  });
  const typeIds = mcpTypes.map((o) => o.meta.id!);

  // Step 2: Find existing MCP forms via CMS API
  const formResults = await cms.getTypedObjects(branch, String(TYPE_REF_FORM), {
    take: 100,
    attributes: String(ATTR_NAME),
    languages: String(LANG_EN),
  }) as { objects?: CmsObject[] };

  const mcpForms = (formResults.objects ?? []).filter((o) => {
    const name = getStringValue(o, ATTR_NAME, LANG_EN);
    return name?.startsWith("MCP");
  });
  const formIds = mcpForms.map((o) => o.meta.id!);

  // Step 3: Find existing MCP app areas via CMS API
  const appAreaResults = await cms.getTypedObjects(branch, String(TYPE_REF_APP_AREA), {
    take: 100,
    attributes: String(ATTR_NAME),
    languages: String(LANG_EN),
  }) as { objects?: CmsObject[] };

  const mcpAppAreas = (appAreaResults.objects ?? []).filter((o) => {
    const name = getStringValue(o, ATTR_NAME, LANG_EN);
    return name?.startsWith("MCP");
  });
  const appAreaIds = mcpAppAreas.map((o) => o.meta.id!);

  // Step 4: For each type, find linked forms and object instances
  const allAttrIds: number[] = [];
  const allInstanceIds: number[] = [];

  for (const typeId of typeIds) {
    // Read the type object to find linked forms
    try {
      const typeObj = await cms.getObject(branch, String(typeId), {
        inherited: true,
      }) as CmsObject;

      const createFormIds = extractMultiValueObjRef(typeObj, ATTR_OBJ_TYPE_CREATE_FORM);
      const detailFormIds = extractMultiValueObjRef(typeObj, ATTR_OBJ_TYPE_DETAIL_FORMS);
      for (const fid of [...createFormIds, ...detailFormIds]) {
        if (!formIds.includes(fid)) formIds.push(fid);
      }
    } catch {
      // Type might not be readable, skip
    }

    // Find instances of this type
    try {
      const instanceResult = await cms.getTypedObjects(branch, String(typeId), {
        take: 100,
        attributes: "1000",
      }) as { objects?: { meta: { id: number } }[] };

      const instanceIds = (instanceResult.objects ?? []).map((o) => o.meta.id);
      allInstanceIds.push(...instanceIds);
    } catch {
      // Type might not have instances, skip
    }
  }

  // Step 4b: For each form, extract attribute definition IDs from form fields
  for (const formId of formIds) {
    try {
      const formObj = await cms.getObject(branch, String(formId), {
        inherited: true,
      }) as CmsObject;

      const fieldIds = extractFormFields(formObj);
      for (const attrId of fieldIds) {
        if (!allAttrIds.includes(attrId)) allAttrIds.push(attrId);
      }
    } catch {
      // Form might not be readable, skip
    }
  }

  // Step 5: Delete in correct order: instances -> app areas -> forms -> types -> attributes
  const deleteIds = (ids: number[]) =>
    ids.length > 0
      ? cms.deleteObjects(branch, ids.map(String), {
          comment: "MCP test cleanup",
        })
      : Promise.resolve();

  if (allInstanceIds.length > 0) {
    await deleteIds(allInstanceIds);
  }

  if (appAreaIds.length > 0) {
    await deleteIds(appAreaIds);
  }

  if (formIds.length > 0) {
    await deleteIds(formIds);
  }

  if (typeIds.length > 0) {
    await deleteIds(typeIds);
  }

  if (allAttrIds.length > 0) {
    await deleteIds(allAttrIds);
  }
}
