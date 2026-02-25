---
name: get-jobs
description: "List jobs for a branch with optional filters and pagination."
allowed-tools: mcp__novadb__novadb_cms_get_jobs, novadb_cms_get_jobs
---

# Get Jobs

List jobs for a branch with optional filters and pagination.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools

1. `novadb_cms_get_jobs` — List jobs

## Parameters

```json
{
  "branchId": 2100347,
  "definitionRef": 12345,
  "state": 2,
  "triggerRef": 100,
  "createdBy": "jdoe",
  "isDeleted": false,
  "take": 10,
  "continue": "opaque-token"
}
```

- `branchId` — Branch ID (number, required)
- `definitionRef` — Filter by job definition ID (optional)
- `state` — Filter by state (optional, see table below)
- `triggerRef` — Filter by trigger ID (optional)
- `createdBy` — Filter by creator username (optional)
- `isDeleted` — Filter by deleted status (optional)
- `take` — Page size, default 5 (optional)
- `continue` — Opaque continuation token from previous response for pagination (optional, omit for first page)

## Job States

| Value | State |
|-------|-------|
| 0 | New |
| 1 | Running |
| 2 | Succeeded |
| 3 | Error |
| 4 | KillRequested |
| 5 | RestartRequested |

## Pagination

The response includes a `continue` token when more pages exist. Pass this token in the next call to fetch the next page. Omit `continue` for the first page.

## Response

Returns `{ jobs: [...], continue?: "token" }`.
