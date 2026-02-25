---
name: create-comment
description: "Create a new comment on an object in NovaDB."
allowed-tools: novadb_cms_create_comment, novadb_cms_get_comment
---

# Create Comment

Create a new comment on an object in NovaDB.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools

1. `novadb_cms_create_comment` — Create the comment
2. `novadb_cms_get_comment` — Fetch the created comment (required follow-up)

## Parameters

```json
{
  "branchId": 2100347,
  "objectRef": 12345,
  "body": "<div>My comment text</div>",
  "username": "jdoe"
}
```

- `branchId` — Branch ID (number, required)
- `objectRef` — Object ID to comment on (number, required)
- `body` — Comment body as XHTML (string, required, see body rules below)
- `username` — (optional) Acting username for audit

## XHTML Body Rule

The comment body **must** be valid XHTML with a `<div>` root element.

- If the user provides plain text, wrap it: `<div>user text here</div>`
- If the body already starts with `<div>` or `<div `, use it as-is
- Example: user says "Great work!" → body = `"<div>Great work!</div>"`

## Workflow

1. Ensure the body is valid XHTML (wrap in `<div>` if needed)
2. Call `novadb_cms_create_comment` with the XHTML body
3. The response returns only `{ id }` — **not** the full comment
4. Call `novadb_cms_get_comment` with the returned `id` to fetch the full comment
5. Return the full comment data to the user

## Response

The create call returns `{ id }`. After fetching, the full comment includes id, body, branch, object reference, author, timestamps, etc.
