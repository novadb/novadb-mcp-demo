---
name: generate-code-for-types
description: "Generate C# code for all (or filtered) object types in a branch."
allowed-tools: mcp__novadb__novadb_cms_get_code_generator_types, novadb_cms_get_code_generator_types
---

# Generate Code for Types

Generate C# code for all (or filtered) object types in a branch.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools

1. `novadb_cms_get_code_generator_types` — Generate code for types

## Parameters

```json
{
  "branch": "2100347",
  "language": "csharp",
  "ids": "100,200"
}
```

- `branch` — Branch ID or `"draft"` (string, required)
- `language` — **Always use `"csharp"`**. This is the only supported language. (string, required)
- `ids` — Comma-separated type IDs to filter (optional, omit for all types)

## Important

- The `language` parameter **must** be `"csharp"` — no other language is supported.
- Omit `ids` to generate code for all types in the branch.
- To generate for specific types only, pass their IDs as a comma-separated string.

## Response

Returns the generated C# source code as text.
