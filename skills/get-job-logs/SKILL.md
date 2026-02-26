---
name: get-job-logs
description: "Fetch logs produced by a job."
user-invocable: false
allowed-tools: novadb_cms_get_job_logs
---

# Get Job Logs

Fetch logs produced by a job and save to disk.

## Scope

**This skill ONLY handles:** Fetching the logs produced by a job.

**For job progress** → use `get-job-progress`
**For job artifacts** → use `get-job-artifacts`

## Tools

1. `novadb_cms_get_job_logs` — Fetch job logs and save to disk

## Parameters

```json
{
  "jobId": "abc-123",
  "targetPath": "/home/user/logs/job-abc-123.txt"
}
```

- `jobId` — Job ID (string, required)
- `targetPath` — (Optional) Absolute path where to save the file. If omitted, saves to `<tmpdir>/novadb-files/job-<jobId>-logs.txt`.

## Response

JSON metadata object:

```json
{
  "filePath": "/tmp/novadb-files/job-abc-123-logs.txt",
  "sizeBytes": 54321,
  "contentType": "application/octet-stream"
}
```

## Common Patterns

- Use `targetPath` to save logs with meaningful names
- Without `targetPath`, logs are saved to `<os.tmpdir()>/novadb-files/`
- Parent directories are created automatically if they don't exist
- Read the saved file to inspect log contents
