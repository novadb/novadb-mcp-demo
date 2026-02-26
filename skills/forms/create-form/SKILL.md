---
name: create-form
description: "Create a new form definition (typeRef=50) in NovaDB."
user-invocable: false
allowed-tools: novadb_cms_create_objects, novadb_cms_get_object
---

# Create Form

## Scope

**This skill ONLY handles:** Creating a new form definition (typeRef=50) with initial field list.

**For editing fields on an existing form** → use `set-form-fields` or `add-form-field`
**For linking a form to an object type** → use `link-form-to-type`

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

## Common Patterns

### CmsValue Format
Every value entry follows: `{ attribute, language, variant, value, sortReverse? }`
- `language`: 201=EN, 202=DE, 0=language-independent
- `variant`: 0=default
- `sortReverse`: for multi-value ordering (0, 1, 2, ...)

### Multi-Value ObjRef (Form Fields)
Form content (attribute 5053) uses individual value entries, NOT arrays. Each field is a separate entry with incrementing `sortReverse`:
- ✓ `{ attr: 5053, value: fieldId1, sortReverse: 0 }, { attr: 5053, value: fieldId2, sortReverse: 1 }`
- ✗ `{ attr: 5053, value: [fieldId1, fieldId2] }`

### API Response (POST/Create)
Returns `{ transaction, createdObjectIds: [id] }`. Use the ID to fetch the full object.
