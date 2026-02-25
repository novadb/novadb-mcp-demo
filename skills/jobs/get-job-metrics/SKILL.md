---
name: get-job-metrics
description: "Get metrics (performance data points) for a job."
allowed-tools: mcp__novadb__novadb_cms_get_job_metrics, novadb_cms_get_job_metrics
---

# Get Job Metrics

Get metrics (performance data points) for a job.

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
