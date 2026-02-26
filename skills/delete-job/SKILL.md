---
name: delete-job
description: "Delete a job by its ID."
user-invocable: false
allowed-tools: novadb_cms_delete_job
---

# Delete Job

Delete a job by its ID.

## Scope

**This skill ONLY handles:** Deleting an existing job by its ID.

**For finding the job to delete** → use `get-job` or `get-jobs`

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

## Common Patterns

### API Response (DELETE)
Returns confirmation of deletion.
