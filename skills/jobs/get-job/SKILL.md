# Get Job

Get a single job by its ID.

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
