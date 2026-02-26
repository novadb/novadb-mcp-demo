---
name: get-file
description: "Download a file from NovaDB by name and save it to disk."
user-invocable: false
allowed-tools: novadb_cms_get_file
---

# Get File

Download a file from NovaDB by its file identifier and save it to disk. Returns metadata (file path, size, content type) instead of file content.

## Scope

**This skill ONLY handles:** Downloading a file from NovaDB by its file identifier and saving it to disk.

**For uploading files** → use `upload-file`

## Tools

1. `novadb_cms_get_file` — Download the file and save to disk

## Parameters

```json
{
  "name": "5fe618811cca585a2826a2da06e3ce1b.jpg",
  "targetPath": "/home/user/downloads/report.jpg"
}
```

- `name` — File identifier (hash) with extension (e.g. `5fe618811cca585a2826a2da06e3ce1b.jpg`). For newly uploaded files this is the `fileIdentifier` returned by the upload API. For existing binary objects, read attribute **11000** for the identifier and **11005** for the extension, then concatenate them.
- `targetPath` — (Optional) Absolute path where to save the file. If omitted, saves to `<tmpdir>/novadb-files/<name>`.

## Workflow

1. Call `novadb_cms_get_file` with the file identifier and optionally a `targetPath`
2. The file is saved to disk at the specified (or default) location
3. Metadata is returned: file path, size in bytes, and content type

## Response

JSON metadata object:

```json
{
  "filePath": "/tmp/novadb-files/5fe618811cca585a2826a2da06e3ce1b.jpg",
  "sizeBytes": 12345,
  "contentType": "image/jpeg"
}
```

## Common Patterns

- Use `targetPath` to save files with meaningful names instead of hashes
- Without `targetPath`, files are saved to `<os.tmpdir()>/novadb-files/`
- Parent directories are created automatically if they don't exist
- To find the file identifier on an existing binary object: read attributes 11000 (identifier hash) and 11005 (extension), then use `<attr11000><attr11005>` as the name (e.g. `5fe618811cca585a2826a2da06e3ce1b.jpg`)
