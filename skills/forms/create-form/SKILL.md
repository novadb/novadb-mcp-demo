---
name: create-form
description: "Create a new form (typeRef=50) in NovaDB. Forms define which attribute fields are shown when editing objects."
allowed-tools: mcp__novadb__novadb_cms_create_objects, mcp__novadb__novadb_cms_get_object, novadb_cms_create_objects, novadb_cms_get_object
---

# Create Form

Create a new form (typeRef=50) in NovaDB. Forms define which attribute fields are shown when editing objects. Use `link-form-to-type` to attach the form to an object type after creation.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools Used

- `novadb_cms_create_objects` — Create the form object
- `novadb_cms_get_object` — Fetch the created form for confirmation

## Workflow

### Step 1: Create the Form

Call `novadb_cms_create_objects` with one object:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "typeRef": 50, "apiIdentifier": "<optional-api-id>" },
      "values": [
        { "attribute": 1000, "language": 201, "variant": 0, "value": "Form Name EN" },
        { "attribute": 1000, "language": 202, "variant": 0, "value": "Form Name DE" },
        { "attribute": 5056, "language": 0, "variant": 0, "value": false },
        { "attribute": 5053, "language": 0, "variant": 0, "value": 1234, "sortReverse": 0 },
        { "attribute": 5053, "language": 0, "variant": 0, "value": 5678, "sortReverse": 1 }
      ]
    }
  ]
}
```

- `typeRef: 50` = Form
- Response: `{ createdObjectIds: [<formId>] }`

### Step 2: Fetch and Return

Fetch the created form with `novadb_cms_get_object` (branch, formId, inherited=true) to confirm and return the result.

## Form Attribute IDs

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Name (EN) | 1000 | String | `language: 201`, `variant: 0` |
| Name (DE) | 1000 | String | `language: 202`, `variant: 0` |
| Form content (fields) | 5053 | ObjRef | **Multi-value** — one entry per field with `sortReverse` |
| Condition attribute | 5054 | ObjRef | Form visible only when this attribute has a value |
| Condition refs | 5055 | ObjRef | Multi-value |
| Is single editor | 5056 | Boolean | Render as single code editor instead of individual fields |

## Form Content (5053) — Multi-Value Pattern

**CRITICAL**: Each field is a separate CmsValue entry with incrementing `sortReverse` (0, 1, 2, ...). Never pass an array as the value.

```json
{ "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId1>", "sortReverse": 0 },
{ "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId2>", "sortReverse": 1 },
{ "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId3>", "sortReverse": 2 }
```

## Minimum Required

Only `nameEn` (attribute 1000, language 201) and `isSingleEditor` (5056, typically `false`) are required. Fields, German name, condition attribute, and API identifier are all optional.
