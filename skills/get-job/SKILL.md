---
name: get-job
description: "Fetch a single job by its ID."
user-invocable: false
allowed-tools: novadb_cms_get_job
---

# Get Job

Fetch a single job by its ID.

## Scope

**This skill ONLY handles:** Fetching a single job by its ID including state, definition, and timestamps.

**For listing all jobs** → use `get-jobs`
**For detailed monitoring** → use `get-job-progress`, `get-job-logs`, or `get-job-metrics`

## Tools

1. `novadb_cms_get_job` — Fetch the job

## Parameters

```json
{
  "jobId": "abc-123"
}
```

- `jobId` — Job ID (string, required)

## Response

Returns the full job object including id, state, definition, branch, progress, timestamps, parameters, etc.

## Job States

| Value | State |
|-------|-------|
| 0 | New |
| 1 | Running |
| 2 | Succeeded |
| 3 | Error |
| 4 | KillRequested |
| 5 | RestartRequested |

## Common Patterns

### Job States
0=New, 1=Running, 2=Succeeded, 3=Error, 4=KillRequested, 5=RestartRequested.

### API Response (GET Job)
Returns the full job object including state, definition, progress, and timestamps.
