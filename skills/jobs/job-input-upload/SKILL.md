# Job Input Upload

Upload an input file for a job. Supports chunked uploads for large files.

## Tools

1. `novadb_cms_job_input_upload` — Start the upload (first chunk)
2. `novadb_cms_job_input_continue` — Continue with subsequent chunks
3. `novadb_cms_job_input_cancel` — Cancel an in-progress upload

## Parameters

### Start upload
```json
{
  "fileBase64": "<base64-encoded-content>",
  "filename": "input.csv"
}
```

### Continue upload
```json
{
  "token": "upload-token-from-previous-call",
  "fileBase64": "<base64-encoded-content>",
  "filename": "input.csv"
}
```

### Cancel upload
```json
{
  "token": "upload-token-to-cancel"
}
```

## Workflow

### Single-chunk upload

1. Base64-encode the file content
2. Call `novadb_cms_job_input_upload` with the encoded content and filename
3. Response returns `{ token, name }` — use these as the `inputFile` parameter when creating a job

### Chunked upload (large files)

1. Base64-encode the first chunk
2. Call `novadb_cms_job_input_upload` — response returns `{ token }`
3. For each subsequent chunk, call `novadb_cms_job_input_continue` with the token and next chunk
4. Use the final `{ token, name }` as the `inputFile` parameter when creating a job

### Cancel

Call `novadb_cms_job_input_cancel` with the token to abort an in-progress upload.

## Response

- **Upload/Continue** — Returns `{ token, name }` for use with `novadb_cms_create_job`'s `inputFile` parameter
- **Cancel** — Returns confirmation of cancellation
