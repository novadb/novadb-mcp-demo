---
name: set-form-fields
description: "Replace ALL fields on a form with a complete ordered list."
user-invocable: false
allowed-tools: novadb_cms_update_objects
---

# Set Form Fields

## Scope

**This skill ONLY handles:** Replacing the entire field list (attribute 5053) on an existing form with a new complete list.

**For adding a single field without replacing others** → use `add-form-field`
**For reading a form's current fields** → use `get-form`

Replace ALL fields on a form. Provide the COMPLETE ordered list of attribute definition IDs — any omitted fields will be removed from the form.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_cms_update_objects`

## Parameters

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "id": "<formId>", "typeRef": 50 },
      "values": [
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId1>", "sortReverse": 0 },
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId2>", "sortReverse": 1 },
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId3>", "sortReverse": 2 }
      ]
    }
  ]
}
```

- `typeRef: 50` = Form
- Each field is a separate CmsValue with `attribute: 5053` and incrementing `sortReverse`

## Multi-Value Pattern

**CRITICAL**: Form content (5053) uses the multi-value ObjRef pattern. Each field must be a separate CmsValue entry. Never pass an array as the value.

```json
{ "attribute": 5053, "language": 0, "variant": 0, "value": 1001, "sortReverse": 0 },
{ "attribute": 5053, "language": 0, "variant": 0, "value": 1002, "sortReverse": 1 }
```

## Response

Returns `{ updatedObjects, createdValues, transaction }`.

## Important

This is a **full replacement** operation. All existing fields are replaced by the provided list. To add a single field without replacing all others, use the `add-form-field` skill instead.

## Common Patterns

### Multi-Value ObjRef (Form Fields)
Form content (attribute 5053) uses individual value entries, NOT arrays. Each field is a separate entry with incrementing `sortReverse`:
- ✓ `{ attr: 5053, value: fieldId1, sortReverse: 0 }, { attr: 5053, value: fieldId2, sortReverse: 1 }`
- ✗ `{ attr: 5053, value: [fieldId1, fieldId2] }`

**WARNING:** This is a full replacement operation. Omitted fields will be removed from the form. Always read the current form first to avoid data loss.

### API Response (PATCH/Update)
Returns `{ transaction }`. Fetch the form afterward to confirm changes.
