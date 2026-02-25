---
name: delete-attribute
description: "Soft-delete an attribute definition."
allowed-tools: mcp__novadb__novadb_cms_delete_objects, novadb_cms_delete_objects
---

# Delete Attribute

Soft-delete an attribute definition.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_cms_delete_objects`

## Parameters

```json
{
  "branch": "draft",
  "objectIds": ["12345"],
  "comment": "No longer needed",
  "username": "jdoe"
}
```

- `branch` — Branch ID or `"draft"`
- `objectIds` — Array with the attribute ID (string)
- `comment` / `username` — (optional) Audit trail

## Response

Returns `{ deletedObjects, transaction }`.

## Warning

Deleting an attribute does NOT automatically remove it from forms. After deletion, you may need to update affected forms using the set-form-fields skill to remove references to the deleted attribute.
