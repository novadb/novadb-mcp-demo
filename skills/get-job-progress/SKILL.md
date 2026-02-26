---
name: get-job-progress
description: "Get current progress of a running job."
user-invocable: false
allowed-tools: novadb_cms_get_job_progress
---

# Get Job Progress

Get the current progress of a running job.

## Scope

**This skill ONLY handles:** Fetching the current progress of a job.

**For full job details** → use `get-job`
**For job logs** → use `get-job-logs`

## Tools

1. `novadb_cms_get_job_progress` — Fetch job progress

## Parameters

```json
{
  "jobId": "abc-123"
}
```

- `jobId` — Job ID (string, required)

## Response

Returns progress information for the job (e.g. percentage complete, items processed).

## Common Patterns

### API Response (GET Job Progress)
Returns progress information including percentage and items processed.
