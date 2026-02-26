---
name: delete-comment
description: "Delete a comment by its ID."
user-invocable: false
allowed-tools: novadb_cms_delete_comment
---

# Delete Comment

## Scope

**This skill ONLY handles:** Deleting an existing comment by its ID.

**For finding the comment to delete** → use `get-comment` or `get-comments`

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

## Common Patterns

### API Response (DELETE)
Returns confirmation of deletion. Deletion cannot be undone.
