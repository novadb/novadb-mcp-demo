---
name: add-form-field
description: "Append an attribute definition to the end of a form's field list without replacing existing fields."
allowed-tools: mcp__novadb__novadb_cms_get_object, mcp__novadb__novadb_cms_update_objects, novadb_cms_get_object, novadb_cms_update_objects
---

# Add Form Field

Append an attribute definition to the end of a form's field list without replacing existing fields.

## Tools Used

- `novadb_cms_get_object` — Read current form to get existing fields
- `novadb_cms_update_objects` — Update form with the new complete field list

## Workflow

### Step 1: Read Current Form

Call `novadb_cms_get_object`:

```json
{
  "branch": "<branch>",
  "objectId": "<formId>",
  "inherited": true
}
```

### Step 2: Extract Existing Fields

From the form's `values` array, find all entries with `attribute: 5053`. Sort by `sortReverse` ascending. Extract the `value` (attribute definition ID) from each.

### Step 3: Build Updated Field List

Append the new attribute definition ID to the existing list. Rebuild ALL 5053 entries with correct `sortReverse` ordering (0, 1, 2, ...).

### Step 4: Update the Form

Call `novadb_cms_update_objects`:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "id": "<formId>", "typeRef": 50 },
      "values": [
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<existingId1>", "sortReverse": 0 },
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<existingId2>", "sortReverse": 1 },
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<newAttrDefId>", "sortReverse": 2 }
      ]
    }
  ]
}
```

## Key Details

- `typeRef: 50` = Form
- The complete field list must be sent — this is a replacement of all 5053 values
- Each field is a separate CmsValue entry with incrementing `sortReverse`
- The new field is appended at the end (highest `sortReverse`)

## Response

Returns `{ updatedObjects, createdValues, transaction }`.
