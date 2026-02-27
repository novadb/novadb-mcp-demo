---
name: generate-code-for-types
description: "Generate C# code for multiple or all object types in a branch."
user-invocable: false
allowed-tools: novadb_cms_get_code_generator_types
---

# Generate Code for Types

Generate C# code for multiple or all object types in a branch and save to disk. ONLY for multi-type code generation — NOT for single-type generation or any other operations.

## Scope

**This skill ONLY handles:** Generating C# source code for multiple or all object types in a branch.

**For generating code for a single type** → use `generate-code-for-type`

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools

1. `novadb_cms_get_code_generator_types` — Generate code for types and save to disk

## Parameters

```json
{
  "branch": "2100347",
  "language": "csharp",
  "ids": "100,200",
  "targetPath": "types.cs"
}
```

- `branch` — Branch ID or `"draft"` (string, required)
- `language` — **Always use `"csharp"`**. This is the only supported language. (string, required)
- `ids` — Comma-separated type IDs to filter (optional, omit for all types)
- `targetPath` — (Optional) Filename, e.g. `"types.cs"`. Subdirectories like `"codegen/types.cs"` are allowed and created automatically.

## Important

- The `language` parameter **must** be `"csharp"` — no other language is supported.
- Omit `ids` to generate code for all types in the branch.
- To generate for specific types only, pass their IDs as a comma-separated string.

## Response

JSON metadata object:

```json
{
  "filePath": "types.cs",
  "sizeBytes": 98765,
  "contentType": "text/plain"
}
```

## Common Patterns

### Language Parameter
Only `"csharp"` is supported. No other languages are available.

### Generating for All Types
Omit the `ids` parameter to generate code for all types in the branch.

### Reading the Generated Code
Read the saved file to inspect or process the generated C# source code.
