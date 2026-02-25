---
name: update-attribute
description: "Update properties of an existing attribute definition (typeRef=10). Only send changed fields."
allowed-tools: novadb_cms_update_objects
---

# Update Attribute

Update properties of an existing attribute definition (typeRef=10). Only send changed fields.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_cms_update_objects`

## Parameters

- `branch` — Branch ID or `"draft"`
- `objects` — Array with one object: `{ meta: { id: <attrId>, typeRef: 10 }, values: [...] }`
- `comment` / `username` — (optional) Audit trail

## Attribute Property IDs

Only include values for fields being changed. See the full table in the create-attribute skill.

| Field | Attr ID | Type | Language | Notes |
|-------|---------|------|----------|-------|
| Name (EN) | 1000 | String | 201 | |
| Name (DE) | 1000 | String | 202 | |
| Description (EN) | 1012 | TextRef | 201 | |
| Description (DE) | 1012 | TextRef | 202 | |
| Data type | 1001 | String.DataType | 0 | |
| Language dependent | 1017 | Boolean | 0 | |
| Required | 1018 | Boolean | 0 | |
| Allow multiple | 1004 | Boolean | 0 | |
| Predefined values | 1006 | Boolean | 0 | |
| Unique values | 1032 | Boolean | 0 | |
| Allowed types | 1015 | ObjRef | 0 | Separate entries with `sortReverse` |
| Inheritance behavior | 1013 | String | 0 | `"None"` / `"Inheriting"` / `"InheritingAll"` |
| Virtual | 1020 | Boolean | 0 | |
| Parent group | 1019 | ObjRef | 0 | |
| Sortable values | 1005 | Boolean | 0 | |
| Format string | 1007 | String | 0 | |
| Search filter | 1010 | Boolean | 0 | |
| List view column | 1011 | Boolean | 0 | |
| Variant axis | 1002 | ObjRef | 0 | |
| Unit of measure | 1003 | ObjRef | 0 | |
| Reverse relation name (EN) | 1051 | String | 201 | |
| Reverse relation name (DE) | 1051 | String | 202 | |
| Sortable child objects | 1023 | Boolean | 0 | |
| Disable spell checking | 1028 | Boolean | 0 | |
| Validation code | 1008 | TextRef.JS | 0 | |
| Virtualization code | 1009 | TextRef.JS | 0 | |

## Value Construction Example

Rename an attribute and make it required:

```json
{
  "branch": "draft",
  "objects": [
    {
      "meta": { "id": 12345, "typeRef": 10 },
      "values": [
        { "attribute": 1000, "language": 201, "variant": 0, "value": "New Name" },
        { "attribute": 1018, "language": 0, "variant": 0, "value": true }
      ]
    }
  ],
  "comment": "Renamed and set as required"
}
```

## Response

Returns `{ updatedObjects, createdValues, transaction }`.

## Important

- `apiIdentifier` is immutable after creation — it cannot be changed via update.
- Only provide fields that are changing. Omitted fields are untouched.
