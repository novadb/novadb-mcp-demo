# Delete Branch

Permanently delete a branch. This cannot be undone.

## Tool

`novadb_cms_delete_branch`

## Parameters

```json
{
  "id": "2100500",
  "comment": "No longer needed",
  "username": "jdoe"
}
```

- `id` — Branch ID (string, required)
- `comment` — (optional) Audit trail comment
- `username` — (optional) Acting username for audit

## Response

Returns deletion result with transaction ID.

## Warning

Always confirm with the user before deleting a branch. Branch deletion is permanent and cannot be reversed.
