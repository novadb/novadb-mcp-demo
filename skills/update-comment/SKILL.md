---
name: update-comment
description: "Update an existing comment's body text."
user-invocable: false
allowed-tools: novadb_cms_update_comment, novadb_cms_get_comment
---

# Update Comment

## Scope

**This skill ONLY handles:** Updating the body text of an existing comment.

**For creating new comments** → use `create-comment`

Update an existing comment's body text.

## Tools

1. `novadb_cms_update_comment` — Update the comment
2. `novadb_cms_get_comment` — Fetch the updated comment (required follow-up)

## Parameters

```json
{
  "commentId": "abc-123",
  "body": "<div>Updated comment text</div>",
  "username": "jdoe"
}
```

- `commentId` — Comment ID (string, required)
- `body` — New comment body as XHTML (string, required, see body rules below)
- `username` — (optional) Acting username for audit

## XHTML Body Rule

The comment body **must** be valid XHTML with a `<div>` root element.

- If the user provides plain text, wrap it: `<div>user text here</div>`
- If the body already starts with `<div>` or `<div `, use it as-is
- Example: user says "Updated text" → body = `"<div>Updated text</div>"`

## Workflow

1. Ensure the body is valid XHTML (wrap in `<div>` if needed)
2. Call `novadb_cms_update_comment` with the XHTML body
3. The response is **204 No Content** (empty) — the update succeeded but returns no data
4. Call `novadb_cms_get_comment` with the same `commentId` to fetch the updated comment
5. Return the full updated comment data to the user

## Response

The update call returns 204 No Content. After fetching, the full comment includes the updated body and all other comment fields.

## Common Patterns

### XHTML Body Format
Comment body must be valid XHTML with a `<div>` root element. Wrap plain text as `<div>user text</div>`.

### API Response (Update Comment)
Returns 204 No Content. Fetch the comment afterward with `get-comment` to confirm changes.
