---
name: get-file
description: "Download a file from NovaDB by name and save it to disk."
user-invocable: false
allowed-tools: novadb_cms_get_file
---

# Get File

Download a file from NovaDB by its name and save it to disk. Returns metadata (file path, size, content type) instead of file content.

## Scope

**This skill ONLY handles:** Downloading a file from NovaDB by its GUID-based name and saving it to disk.

**For uploading files** → use `upload-file`

## Tools

1. `novadb_cms_get_file` — Download the file and save to disk

## Parameters

```json
{
  "name": "a1b2c3d4.png",
  "targetPath": "/home/user/downloads/report.png"
}
```

- `name` — File name/identifier, typically a GUID with extension (e.g. `a1b2c3d4.png`)
- `targetPath` — (Optional) Absolute path where to save the file. If omitted, saves to `<tmpdir>/novadb-files/<name>`.

## Workflow

1. Call `novadb_cms_get_file` with the file name and optionally a `targetPath`
2. The file is saved to disk at the specified (or default) location
3. Metadata is returned: file path, size in bytes, and content type

## Response

JSON metadata object:

```json
{
  "filePath": "/tmp/novadb-files/a1b2c3d4.png",
  "sizeBytes": 12345,
  "contentType": "image/png"
}
```

## Common Patterns

- Use `targetPath` to save files with meaningful names instead of GUIDs
- Without `targetPath`, files are saved to `<os.tmpdir()>/novadb-files/`
- Parent directories are created automatically if they don't exist
