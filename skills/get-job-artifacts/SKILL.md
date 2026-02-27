---
name: get-job-artifacts
description: "List, fetch, or download job artifacts."
user-invocable: false
allowed-tools: novadb_cms_get_job_artifacts, novadb_cms_get_job_artifact, novadb_cms_get_job_artifacts_zip
---

# Get Job Artifacts

List, fetch, or download artifacts produced by a job.

## Scope

**This skill ONLY handles:** Listing job artifacts, fetching a specific artifact, or downloading all artifacts as ZIP.

**For job logs** → use `get-job-logs`
**For processed object IDs** → use `get-job-object-ids`

## Tools

1. `novadb_cms_get_job_artifacts` — List all artifacts for a job
2. `novadb_cms_get_job_artifact` — Download a specific artifact by path and save to disk
3. `novadb_cms_get_job_artifacts_zip` — Download all artifacts as a ZIP and save to disk

## Parameters

### List artifacts
```json
{
  "jobId": "abc-123"
}
```

### Get specific artifact
```json
{
  "jobId": "abc-123",
  "path": "output/report.csv",
  "targetPath": "report.csv"
}
```

- `targetPath` — (Optional) Filename, e.g. `"report.csv"`. Subdirectories like `"artifacts/report.csv"` are allowed and created automatically.

### Download all as ZIP
```json
{
  "jobId": "abc-123",
  "targetPath": "all.zip"
}
```

- `targetPath` — (Optional) Filename, e.g. `"all.zip"`. Subdirectories like `"artifacts/all.zip"` are allowed and created automatically.

## Workflow

1. Call `novadb_cms_get_job_artifacts` to list available artifacts
2. To download a specific artifact, call `novadb_cms_get_job_artifact` with the artifact path
3. To download all artifacts at once, call `novadb_cms_get_job_artifacts_zip`

## Response

- **List** — Returns an array of artifact metadata (paths, sizes, etc.)
- **Single / ZIP** — Returns JSON metadata:

```json
{
  "filePath": "report.csv",
  "sizeBytes": 12345,
  "contentType": "application/octet-stream"
}
```

## Common Patterns

- Use `targetPath` to save files with meaningful names
- Always provide a `targetPath` to control where files are saved
- Parent directories are created automatically if they don't exist
- Read the saved file to inspect artifact contents
