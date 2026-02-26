---
name: upload-file
description: "Start a file upload to NovaDB (single-chunk or first chunk of multi-chunk)."
user-invocable: false
allowed-tools: novadb_cms_upload_file
---

# Upload File

Start uploading a file to NovaDB. For single-chunk uploads, set `commit=true` to complete immediately.

## Scope

**This skill ONLY handles:** Starting a new file upload to NovaDB (single-chunk or first chunk of multi-chunk upload).

**For continuing a chunked upload** → use `upload-file-continue`
**For canceling an in-progress upload** → use `upload-file-cancel`

## Tools

1. `novadb_cms_upload_file` — Start the upload

## Parameters

```json
{
  "fileBase64": "<base64-encoded-content>",
  "filename": "photo.jpg",
  "extension": "jpg",
  "commit": true
}
```

- `fileBase64` — File content, base64-encoded (required)
- `filename` — Original filename (required)
- `extension` — File extension **without dot** (e.g. `jpg`, `pdf`, `png`) (required)
- `commit` — `true` for single-chunk uploads (completes immediately), `false` for chunked uploads (required)

## Workflow

### Single-chunk upload (`commit: true`)

1. Base64-encode the file content
2. Call `novadb_cms_upload_file` with `commit: true`
3. Response returns `{ guid }` — the file identifier for use in object values

### Chunked upload (`commit: false`)

1. Base64-encode the first chunk
2. Call `novadb_cms_upload_file` with `commit: false`
3. Response returns `{ token }` — use this token with `novadb_cms_upload_file_continue` for subsequent chunks
4. On the final chunk, call `novadb_cms_upload_file_continue` with `commit: true`

## Response

- `commit: true` → `{ guid }` (file GUID for referencing)
- `commit: false` → `{ token }` (upload token for continuing)

## Common Patterns

### Base64 Encoding
File content must be base64-encoded before upload.

### API Response (Upload)
- Single-chunk (commit=true): Returns `{ guid }` — the file identifier.
- Multi-chunk (commit=false): Returns `{ token }` — use with `upload-file-continue`.
