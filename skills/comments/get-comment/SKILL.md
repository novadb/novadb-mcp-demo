---
name: get-comment
description: "Fetch a single comment by its ID."
user-invocable: false
allowed-tools: novadb_cms_get_comment
---

# Get Comment

## Scope

**This skill ONLY handles:** Fetching a single comment by its ID.

**For listing/filtering comments** → use `get-comments`

Fetch a single comment by its ID.

## Tool

`novadb_cms_get_comment`

## Parameters

```json
{
  "commentId": "abc-123"
}
```

- `commentId` — Comment ID (string, required)

## Response

Returns the full comment object including id, body, branch reference, object reference, author, timestamps, and deleted status.

## Common Patterns

### API Response (GET Comment)
Returns the full comment object including id, body, branch reference, object reference, author, timestamps, and deleted status.
