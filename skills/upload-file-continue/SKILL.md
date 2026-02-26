---
name: upload-file-continue
description: "Continue a chunked file upload with additional chunks."
user-invocable: false
allowed-tools: novadb_cms_upload_file_continue
---

# Upload File Continue

Continue a chunked file upload that was started with `novadb_cms_upload_file`.

## Scope

**This skill ONLY handles:** Sending additional chunks for an in-progress file upload.

**For starting a new upload** → use `upload-file`
**For canceling an in-progress upload** → use `upload-file-cancel`

## Tools

1. `novadb_cms_upload_file_continue` — Send the next chunk

## Parameters

```json
{
  "sourcePath": "/absolute/path/to/chunk-file",
  "extension": "jpg",
  "commit": false,
  "token": "<upload-token>"
}
```

- `sourcePath` — Absolute path to the chunk file on disk (required)
- `filename` — Override filename (optional, defaults to basename of sourcePath)
- `extension` — File extension without dot (required)
- `commit` — `true` on the **final** chunk to complete the upload, `false` otherwise (required)
- `token` — Upload token returned by `novadb_cms_upload_file` (required)

## Workflow

1. Use the `token` from the initial `novadb_cms_upload_file` call
2. Call `novadb_cms_upload_file_continue` for each additional chunk
3. Set `commit: true` on the last chunk to finalize the upload

## Response

- `commit: false` → acknowledgment, continue sending chunks
- `commit: true` → `{ token, fileIdentifier }` (`fileIdentifier` is the hash for downloading via `get-file`)
