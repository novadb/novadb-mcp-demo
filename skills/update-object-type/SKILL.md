---
name: update-object-type
description: "Update name or description of an existing object type."
user-invocable: false
allowed-tools: novadb_cms_update_objects
---

# Update Object Type

Update name or description of an existing object type. ONLY for modifying type properties — NOT for creating types, adding attributes, or editing forms.

## Scope

**This skill ONLY handles:** Updating the name or description of an existing object type (typeRef=0).

**For adding attributes to a type** → use `add-attribute-to-type`
**For reading a type's full definition** → use `get-object-type`

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

## Common Patterns

### CmsValue Format
Every value entry follows: `{ attribute, language, variant, value }`
- `language`: 201=EN, 202=DE, 0=language-independent
- `variant`: 0=default
- Only include fields being changed; omitted fields remain unchanged.

### API Response (PATCH/Update)
Returns `{ transaction }`. Fetch the object type afterward to confirm changes.
