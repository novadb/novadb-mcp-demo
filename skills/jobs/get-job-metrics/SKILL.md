---
name: get-job-metrics
description: "Get performance metric data points for a job."
user-invocable: false
allowed-tools: novadb_cms_get_job_metrics
---

# Get Job Metrics

Get performance metric data points for a job.

## Scope

**This skill ONLY handles:** Fetching performance metric data points for a job.

**For job progress** → use `get-job-progress`
**For full job details** → use `get-job`

## Tools

1. `novadb_cms_get_job_metrics` — Fetch job metrics

## Parameters

```json
{
  "jobId": "abc-123",
  "maxItems": 100
}
```

- `jobId` — Job ID (string, required)
- `maxItems` — Limit the number of metric points returned (optional)

## Response

Returns an array of metric data points for the job.

## Common Patterns

### API Response (GET Job Metrics)
Returns an array of metric data points. Use `maxItems` parameter to limit results.
