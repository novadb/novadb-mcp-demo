---
name: get-job-logs
description: "Fetch logs produced by a job."
user-invocable: false
allowed-tools: novadb_cms_get_job_logs
---

# Get Job Logs

Fetch logs produced by a job.

## Scope

**This skill ONLY handles:** Fetching the logs produced by a job.

**For job progress** → use `get-job-progress`
**For job artifacts** → use `get-job-artifacts`

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

## Common Patterns

### API Response (GET Job Logs)
Returns logs as plain text content.
