---
name: update-object-type
description: "Update an object type's name or description in NovaDB."
allowed-tools: mcp__novadb__novadb_cms_update_objects, novadb_cms_update_objects
---

# Update Object Type

Update an object type's name or description in NovaDB.

## Tool

`novadb_cms_update_objects`

## Parameters

Build a `values` array with only the fields you want to change.

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Name (EN) | 1000 | String | `language: 201`, `variant: 0` |
| Name (DE) | 1000 | String | `language: 202`, `variant: 0` |
| Description (EN) | 1012 | String | `language: 201`, `variant: 0` |
| Description (DE) | 1012 | String | `language: 202`, `variant: 0` |

## Value Construction

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "id": "<typeId>", "typeRef": 0 },
      "values": [
        { "attribute": 1000, "language": 201, "variant": 0, "value": "New English Name" },
        { "attribute": 1000, "language": 202, "variant": 0, "value": "Neuer deutscher Name" },
        { "attribute": 1012, "language": 201, "variant": 0, "value": "New description" },
        { "attribute": 1012, "language": 202, "variant": 0, "value": "Neue Beschreibung" }
      ]
    }
  ]
}
```

- `typeRef: 0` = Object Type
- Only include values for fields you want to change
- At least one field must be provided

## Response

Returns `{ updatedObjects, createdValues, transaction }`.
