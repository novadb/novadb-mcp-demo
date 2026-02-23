# Delete Job

Delete a job by its ID.

## Tools

1. `novadb_cms_delete_job` — Delete the job

## Parameters

```json
{
  "jobId": "abc-123",
  "username": "jdoe"
}
```

- `jobId` — Job ID (string, required)
- `username` — Acting username for audit (optional)

## Response

Returns confirmation of deletion.
