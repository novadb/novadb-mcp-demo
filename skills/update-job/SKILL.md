---
name: update-job
description: "Update job state or retention settings."
user-invocable: false
allowed-tools: novadb_cms_update_job
---

# Update Job

Update job state or retention settings.

## Scope

**This skill ONLY handles:** Updating job state (kill/restart) or retention settings.

**For full job details** → use `get-job`

## Tools

1. `novadb_cms_update_job` — Update the job

## Parameters

```json
{
  "jobId": "abc-123",
  "state": 4,
  "retainUntil": "2025-12-31T23:59:59Z",
  "username": "jdoe"
}
```

- `jobId` — Job ID (string, required)
- `state` — New state (optional, see valid transitions below)
- `retainUntil` — ISO date-time until which to retain the job (optional)
- `username` — Acting username for audit (optional)

## Valid State Transitions

Only two state values can be set via update:

| Value | State | Purpose |
|-------|-------|---------|
| 4 | KillRequested | Request to stop a running job |
| 5 | RestartRequested | Request to restart a job |

Other states (0=New, 1=Running, 2=Succeeded, 3=Error) are managed by the system and cannot be set directly.

## Response

Returns the updated job object.

## Common Patterns

### Valid State Transitions
Only `4` (KillRequest) and `5` (RestartRequest) can be set manually. Other states are managed by the system.

### API Response (Update Job)
Returns confirmation of the update.
