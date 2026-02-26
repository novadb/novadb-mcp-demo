---
name: get-file
description: "Download a file from NovaDB by name."
user-invocable: false
allowed-tools: novadb_cms_get_file
---

# Get File

Download a file from NovaDB by its name.

## Scope

**This skill ONLY handles:** Downloading a file from NovaDB by its GUID-based name.

**For uploading files** → use `upload-file`

## Tools

1. `novadb_cms_get_file` — Download the file

## Parameters

```json
{
  "name": "a1b2c3d4.png"
}
```

- `name` — File name/identifier, typically a GUID with extension (e.g. `a1b2c3d4.png`)

## Workflow

1. Call `novadb_cms_get_file` with the file name
2. Text files are returned as-is
3. Binary files are returned prefixed with `[base64] ` followed by the base64-encoded content

## Response

- Text content: the raw file text
- Binary content: `[base64] <base64-encoded-data>`

## Common Patterns

### API Response (GET File)
- Text files: Returned as plain text content.
- Binary files: Returned prefixed with `[base64] ` followed by base64-encoded content.
