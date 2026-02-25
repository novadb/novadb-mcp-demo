---
name: get-file
description: "Download a file from NovaDB by its name."
allowed-tools: mcp__novadb__novadb_cms_get_file, novadb_cms_get_file
---

# Get File

Download a file from NovaDB by its name.

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
