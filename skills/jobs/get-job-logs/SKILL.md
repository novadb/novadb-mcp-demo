---
name: get-job-logs
description: "Get the logs produced by a job."
allowed-tools: mcp__novadb__novadb_cms_get_job_logs, novadb_cms_get_job_logs
---

# Get Job Logs

Get the logs produced by a job.

## Tools

1. `novadb_cms_get_job_logs` — Fetch job logs

## Parameters

```json
{
  "jobId": "abc-123"
}
```

- `jobId` — Job ID (string, required)

## Response

Returns the job logs as text.
