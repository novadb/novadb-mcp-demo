# Create Job

Create and start a new job on a branch. After creation, auto-fetch the full job object.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools

1. `novadb_cms_create_job` — Create the job
2. `novadb_cms_get_job` — Fetch the created job (required follow-up)

## Parameters

```json
{
  "branchId": 2100347,
  "jobDefinitionId": 12345,
  "scopeIds": [100, 200],
  "objIds": [300, 400],
  "parameters": [{ "name": "param1", "values": ["value1"] }],
  "inputFile": { "token": "upload-token", "name": "input.csv" },
  "language": 201,
  "username": "jdoe"
}
```

- `branchId` — Branch ID (number, required)
- `jobDefinitionId` — Job definition ID (number, required)
- `scopeIds` — Scope object IDs (optional)
- `objIds` — Object IDs to process (optional)
- `parameters` — Job parameters as name/values pairs (optional)
- `inputFile` — Input file reference from prior upload via `novadb_cms_job_input_upload` (optional)
- `language` — Language ID for the job (optional)
- `username` — Acting username for audit (optional)

## Workflow

1. Call `novadb_cms_create_job` with the parameters above
2. The response returns `{ id }` — **not** the full job object
3. Call `novadb_cms_get_job` with the returned `id` to fetch the full job
4. Return the full job data to the user

## Response

The create call returns `{ id }`. After fetching, the full job includes id, state, definition, branch, progress, timestamps, etc.
