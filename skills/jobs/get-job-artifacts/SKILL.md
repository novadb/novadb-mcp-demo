---
name: get-job-artifacts
description: "List, fetch, or download job artifacts."
user-invocable: false
allowed-tools: novadb_cms_get_job_artifacts, novadb_cms_get_job_artifact, novadb_cms_get_job_artifacts_zip
---

# Get Job Artifacts

List, fetch, or download artifacts produced by a job.

## Scope

**This skill ONLY handles:** Listing job artifacts, fetching a specific artifact, or downloading all artifacts as ZIP.

**For job logs** → use `get-job-logs`
**For processed object IDs** → use `get-job-object-ids`

## Tools

1. `novadb_cms_get_job_artifacts` — List all artifacts for a job
2. `novadb_cms_get_job_artifact` — Get a specific artifact by path
3. `novadb_cms_get_job_artifacts_zip` — Download all artifacts as a ZIP (base64)

## Parameters

### List artifacts
```json
{
  "jobId": "abc-123"
}
```

### Get specific artifact
```json
{
  "jobId": "abc-123",
  "path": "output/report.csv"
}
```

### Download all as ZIP
```json
{
  "jobId": "abc-123"
}
```

## Workflow

1. Call `novadb_cms_get_job_artifacts` to list available artifacts
2. To view a specific artifact, call `novadb_cms_get_job_artifact` with the artifact path
3. To download all artifacts at once, call `novadb_cms_get_job_artifacts_zip` (returns base64-encoded ZIP)

## Response

- **List** — Returns an array of artifact metadata (paths, sizes, etc.)
- **Single** — Returns the artifact content as text
- **ZIP** — Returns base64-encoded ZIP file containing all artifacts

## Common Patterns

### API Response (GET Job Artifacts)
- List: Returns array of artifact metadata.
- Single artifact: Returns artifact content.
- ZIP download: Returns base64-encoded ZIP of all artifacts.
