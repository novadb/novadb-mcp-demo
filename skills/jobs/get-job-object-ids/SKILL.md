# Get Job Object IDs

Get the IDs of objects processed by a job.

## Tools

1. `novadb_cms_get_job_object_ids` — Fetch processed object IDs

## Parameters

```json
{
  "jobId": "abc-123"
}
```

- `jobId` — Job ID (string, required)

## Response

Returns an array of object IDs that were processed by the job.
