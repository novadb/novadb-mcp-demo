---
name: delete-comment
description: "Delete a comment by its ID."
allowed-tools: novadb_cms_delete_comment
---

# Delete Comment

Delete a comment by its ID.

## Tool

`novadb_cms_delete_comment`

## Parameters

```json
{
  "commentId": "abc-123",
  "username": "jdoe"
}
```

- `commentId` — Comment ID (string, required)
- `username` — (optional) Acting username for audit

## Response

Returns the deletion result.

## Warning

Always confirm with the user before deleting a comment. Comment deletion cannot be undone.
