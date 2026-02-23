# Get Job Progress

Get the current progress of a job.

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
