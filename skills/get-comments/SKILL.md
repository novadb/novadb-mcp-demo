---
name: get-comments
description: "List comments with optional filters and pagination."
user-invocable: false
allowed-tools: novadb_cms_get_comments
---

# Get Comments

## Scope

**This skill ONLY handles:** Listing and filtering comments with pagination support.

**For fetching a single comment by ID** → use `get-comment`

List comments with optional filters. Results are paginated.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_cms_get_comments`

## Parameters

```json
{
  "branchRef": 2100347,
  "objectRef": 12345,
  "user": "jdoe",
  "isDeleted": false,
  "take": 10
}
```

- `branchRef` — (optional) Filter by branch ID
- `objectRef` — (optional) Filter by object ID
- `user` — (optional) Filter by comment author
- `isDeleted` — (optional) Filter by deleted status
- `continue` — (optional) Opaque continuation token from a previous response for pagination. Omit for first page.
- `take` — (optional) Page size (default: 5)

All parameters are optional. Without filters, returns all comments.

## Pagination

The response includes a `continue` token when more pages exist. Pass this token as the `continue` parameter in the next call to fetch the next page.

## Response

Returns an array of comment objects, each with id, body, branch reference, object reference, author, timestamps, and deleted status.

## Common Patterns

### Pagination
Uses opaque `continue` token for next page. Pass the token from the previous response to get the next page.

### API Response (GET Comments)
Returns array of comment objects with pagination. Check for `continue` token in response for more results.
