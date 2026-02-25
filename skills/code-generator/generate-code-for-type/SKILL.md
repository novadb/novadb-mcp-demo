---
name: generate-code-for-type
description: "Generate C# code for a single object type."
allowed-tools: mcp__novadb__novadb_cms_get_code_generator_type, novadb_cms_get_code_generator_type
---

# Generate Code for Type

Generate C# code for a single object type.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools

1. `novadb_cms_get_code_generator_type` — Generate code for one type

## Parameters

```json
{
  "branch": "2100347",
  "language": "csharp",
  "type": "12345"
}
```

- `branch` — Branch ID or `"draft"` (string, required)
- `language` — **Always use `"csharp"`**. This is the only supported language. (string, required)
- `type` — Type ID, GUID, or ApiIdentifier (string, required)

## Important

- The `language` parameter **must** be `"csharp"` — no other language is supported.
- The `type` parameter accepts an ID (numeric string), GUID, or ApiIdentifier.

## Response

Returns the generated C# source code as text.
