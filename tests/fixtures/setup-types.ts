import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { CmsClient, CmsObject, CmsValue, CreateObjectsResponse } from "../../src/cms-api/client.js";
import { buildFormContentValues } from "./helpers.js";
import {
  LANG_EN,
  LANG_DE,
  ATTR_NAME,
  ATTR_DATA_TYPE,
  ATTR_REQUIRED,
  ATTR_ALLOWED_TYPES,
  ATTR_VALIDATION_CODE,
  ATTR_OBJ_TYPE_CREATE_FORM,
  ATTR_OBJ_TYPE_DETAIL_FORMS,
  ATTR_OBJ_TYPE_DISPLAY_NAME,
  ATTR_FORM_IS_SINGLE_EDITOR,
  ATTR_APP_AREA_OBJECT_TYPES,
  ATTR_APP_AREA_SORT_KEY,
  TYPE_REF_OBJECT_TYPE,
  TYPE_REF_ATTRIBUTE_DEF,
  TYPE_REF_FORM,
  TYPE_REF_APP_AREA,
} from "./constants.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface TestFixtureContext {
  companyTypeId: number;
  personTypeId: number;
  companyAttrIds: { name: number; industry: number };
  personAttrIds: { vorname: number; nachname: number; email: number; companyRef: number };
  companyFormId: number;
  personFormId: number;
  appAreaId: number;
  sampleCompanyId: number;
  samplePersonId: number;
}

interface TypeDefinition {
  type: { nameEn: string; nameDe: string };
  attributes: {
    nameEn: string;
    nameDe: string;
    dataType: string;
    required: boolean;
    validationCode?: string;
    allowedTypeRef?: string;
  }[];
  form: { nameEn: string; nameDe: string };
  sampleData: { values: Record<string, string> };
}

interface AppAreaDefinition {
  nameEn: string;
  nameDe: string;
  sortKey: number;
}

function loadDefinition<T>(filename: string): T {
  const filePath = join(__dirname, "definitions", filename);
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

export async function setupMcpTypes(
  cms: CmsClient,
  branch: string,
): Promise<TestFixtureContext> {
  const companyDef = loadDefinition<TypeDefinition>("mcp-company.json");
  const personDef = loadDefinition<TypeDefinition>("mcp-person.json");
  const appAreaDef = loadDefinition<AppAreaDefinition>("mcp-test-app-area.json");

  const comment = "MCP test setup";

  // Step 1: Create MCP-Company object type
  const companyTypeResult = await cms.createObjects(
    branch,
    [
      {
        meta: { typeRef: TYPE_REF_OBJECT_TYPE },
        values: [
          { attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: companyDef.type.nameEn },
          { attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: companyDef.type.nameDe },
        ],
      },
    ],
    { comment },
  ) as CreateObjectsResponse;
  const companyTypeId = companyTypeResult.createdObjectIds[0];

  // Step 2: Create MCP-Person object type
  const personTypeResult = await cms.createObjects(
    branch,
    [
      {
        meta: { typeRef: TYPE_REF_OBJECT_TYPE },
        values: [
          { attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: personDef.type.nameEn },
          { attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: personDef.type.nameDe },
        ],
      },
    ],
    { comment },
  ) as CreateObjectsResponse;
  const personTypeId = personTypeResult.createdObjectIds[0];

  // Step 3: Create MCP-Company attributes
  const companyAttrObjects: CmsObject[] = companyDef.attributes.map((attr) => ({
    meta: { typeRef: TYPE_REF_ATTRIBUTE_DEF },
    values: [
      { attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: attr.nameEn },
      { attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: attr.nameDe },
      { attribute: ATTR_DATA_TYPE, language: 0, variant: 0, value: attr.dataType },
      { attribute: ATTR_REQUIRED, language: 0, variant: 0, value: attr.required },
    ],
  }));

  const companyAttrResult = await cms.createObjects(branch, companyAttrObjects, { comment }) as CreateObjectsResponse;
  const companyAttrIds = {
    name: companyAttrResult.createdObjectIds[0],
    industry: companyAttrResult.createdObjectIds[1],
  };

  // Step 4: Create MCP-Person attributes
  const personAttrObjects: CmsObject[] = personDef.attributes.map((attr) => {
    const values: CmsValue[] = [
      { attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: attr.nameEn },
      { attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: attr.nameDe },
      { attribute: ATTR_DATA_TYPE, language: 0, variant: 0, value: attr.dataType },
      { attribute: ATTR_REQUIRED, language: 0, variant: 0, value: attr.required },
    ];

    if (attr.validationCode) {
      values.push({
        attribute: ATTR_VALIDATION_CODE,
        language: 0,
        variant: 0,
        value: attr.validationCode,
      });
    }

    if (attr.allowedTypeRef === "MCP-Company") {
      values.push({
        attribute: ATTR_ALLOWED_TYPES,
        language: 0,
        variant: 0,
        value: companyTypeId,
      });
    }

    return {
      meta: { typeRef: TYPE_REF_ATTRIBUTE_DEF },
      values,
    };
  });

  const personAttrResult = await cms.createObjects(branch, personAttrObjects, { comment }) as CreateObjectsResponse;
  const personAttrIds = {
    vorname: personAttrResult.createdObjectIds[0],
    nachname: personAttrResult.createdObjectIds[1],
    email: personAttrResult.createdObjectIds[2],
    companyRef: personAttrResult.createdObjectIds[3],
  };

  // Step 5: Create forms (attributes are linked to types through form fields)
  const companyFormResult = await cms.createObjects(
    branch,
    [
      {
        meta: { typeRef: TYPE_REF_FORM },
        values: [
          { attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: companyDef.form.nameEn },
          { attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: companyDef.form.nameDe },
          { attribute: ATTR_FORM_IS_SINGLE_EDITOR, language: 0, variant: 0, value: false },
          ...buildFormContentValues([companyAttrIds.name, companyAttrIds.industry]),
        ],
      },
    ],
    { comment },
  ) as CreateObjectsResponse;
  const companyFormId = companyFormResult.createdObjectIds[0];

  const personFormResult = await cms.createObjects(
    branch,
    [
      {
        meta: { typeRef: TYPE_REF_FORM },
        values: [
          { attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: personDef.form.nameEn },
          { attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: personDef.form.nameDe },
          { attribute: ATTR_FORM_IS_SINGLE_EDITOR, language: 0, variant: 0, value: false },
          ...buildFormContentValues([
            personAttrIds.vorname,
            personAttrIds.nachname,
            personAttrIds.email,
            personAttrIds.companyRef,
          ]),
        ],
      },
    ],
    { comment },
  ) as CreateObjectsResponse;
  const personFormId = personFormResult.createdObjectIds[0];

  // Step 7: Link forms to types (create form + detail tab)
  await cms.updateObjects(
    branch,
    [
      {
        meta: { id: companyTypeId, typeRef: TYPE_REF_OBJECT_TYPE },
        values: [
          { attribute: ATTR_OBJ_TYPE_CREATE_FORM, language: 0, variant: 0, value: companyFormId },
          { attribute: ATTR_OBJ_TYPE_DETAIL_FORMS, language: 0, variant: 0, value: companyFormId, sortReverse: 0 },
          { attribute: ATTR_OBJ_TYPE_DISPLAY_NAME, language: 0, variant: 0, value: companyAttrIds.name },
        ],
      },
      {
        meta: { id: personTypeId, typeRef: TYPE_REF_OBJECT_TYPE },
        values: [
          { attribute: ATTR_OBJ_TYPE_CREATE_FORM, language: 0, variant: 0, value: personFormId },
          { attribute: ATTR_OBJ_TYPE_DETAIL_FORMS, language: 0, variant: 0, value: personFormId, sortReverse: 0 },
          { attribute: ATTR_OBJ_TYPE_DISPLAY_NAME, language: 0, variant: 0, value: personAttrIds.nachname },
        ],
      },
    ],
    { comment },
  );

  // Step 8: Create Application Area
  const appAreaResult = await cms.createObjects(
    branch,
    [
      {
        meta: { typeRef: TYPE_REF_APP_AREA },
        values: [
          { attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: appAreaDef.nameEn },
          { attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: appAreaDef.nameDe },
          {
            attribute: ATTR_APP_AREA_OBJECT_TYPES,
            language: 0,
            variant: 0,
            value: companyTypeId,
            sortReverse: 0,
          },
          {
            attribute: ATTR_APP_AREA_OBJECT_TYPES,
            language: 0,
            variant: 0,
            value: personTypeId,
            sortReverse: 1,
          },
          {
            attribute: ATTR_APP_AREA_SORT_KEY,
            language: 0,
            variant: 0,
            value: appAreaDef.sortKey,
          },
        ],
      },
    ],
    { comment },
  ) as CreateObjectsResponse;
  const appAreaId = appAreaResult.createdObjectIds[0];

  // Step 9: Create sample data
  // Sample Company
  const sampleCompanyResult = await cms.createObjects(
    branch,
    [
      {
        meta: { typeRef: companyTypeId },
        values: [
          {
            attribute: companyAttrIds.name,
            language: 0,
            variant: 0,
            value: companyDef.sampleData.values.name,
          },
          {
            attribute: companyAttrIds.industry,
            language: 0,
            variant: 0,
            value: companyDef.sampleData.values.industry,
          },
        ],
      },
    ],
    { comment },
  ) as CreateObjectsResponse;
  const sampleCompanyId = sampleCompanyResult.createdObjectIds[0];

  // Sample Person (with reference to sample company)
  const samplePersonResult = await cms.createObjects(
    branch,
    [
      {
        meta: { typeRef: personTypeId },
        values: [
          {
            attribute: personAttrIds.vorname,
            language: 0,
            variant: 0,
            value: personDef.sampleData.values.firstName,
          },
          {
            attribute: personAttrIds.nachname,
            language: 0,
            variant: 0,
            value: personDef.sampleData.values.lastName,
          },
          {
            attribute: personAttrIds.email,
            language: 0,
            variant: 0,
            value: personDef.sampleData.values.email,
          },
          {
            attribute: personAttrIds.companyRef,
            language: 0,
            variant: 0,
            value: sampleCompanyId,
          },
        ],
      },
    ],
    { comment },
  ) as CreateObjectsResponse;
  const samplePersonId = samplePersonResult.createdObjectIds[0];

  return {
    companyTypeId,
    personTypeId,
    companyAttrIds,
    personAttrIds,
    companyFormId,
    personFormId,
    appAreaId,
    sampleCompanyId,
    samplePersonId,
  };
}
