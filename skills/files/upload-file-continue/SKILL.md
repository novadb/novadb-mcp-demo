---
name: upload-file-continue
description: "Continue a chunked file upload that was started with novadb_cms_upload_file."
allowed-tools: mcp__novadb__novadb_cms_upload_file_continue, novadb_cms_upload_file_continue
---

# Upload File Continue

Continue a chunked file upload that was started with `novadb_cms_upload_file`.

## Tools

1. `novadb_cms_upload_file_continue` — Send the next chunk

## Parameters

```json
{
  "fileBase64": "<base64-encoded-chunk>",
  "filename": "photo.jpg",
  "extension": "jpg",
  "commit": false,
  "token": "<upload-token>"
}
```

- `fileBase64` — Base64-encoded file content chunk (required)
- `filename` — Original filename (required)
- `extension` — File extension without dot (required)
- `commit` — `true` on the **final** chunk to complete the upload, `false` otherwise (required)
- `token` — Upload token returned by `novadb_cms_upload_file` (required)

## Workflow

1. Use the `token` from the initial `novadb_cms_upload_file` call
2. Call `novadb_cms_upload_file_continue` for each additional chunk
3. Set `commit: true` on the last chunk to finalize the upload

## Response

- `commit: false` → acknowledgment, continue sending chunks
- `commit: true` → `{ guid }` (file GUID for referencing)
