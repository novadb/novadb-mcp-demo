---
name: delete-attribute
description: "Delete an attribute definition from NovaDB."
user-invocable: false
allowed-tools: novadb_cms_delete_objects
---

# Delete Attribute

## Scope

**This skill ONLY handles:** Deleting an existing attribute definition.

**For finding the attribute to delete** → use `get-attribute` or `search-attributes`

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

## Common Patterns

### API Response (DELETE)
Returns `{ transaction }` confirming the deletion.
