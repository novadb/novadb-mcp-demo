# Upload File Cancel

Cancel an in-progress chunked file upload and discard all uploaded data.

## Tools

1. `novadb_cms_upload_file_cancel` — Cancel the upload

## Parameters

```json
{
  "token": "<upload-token>"
}
```

- `token` — Upload token from `novadb_cms_upload_file` (required)

## Workflow

1. Call `novadb_cms_upload_file_cancel` with the upload token
2. The upload is cancelled and all uploaded chunks are discarded

## Response

Confirmation that the upload was cancelled.
