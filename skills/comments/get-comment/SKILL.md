# Get Comment

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
