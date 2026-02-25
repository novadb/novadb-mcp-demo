---
name: get-branch
description: "Fetch a single branch by ID with human-readable ObjRef resolution."
allowed-tools: mcp__novadb__novadb_cms_get_branch, mcp__novadb__novadb_cms_get_objects, novadb_cms_get_branch, novadb_cms_get_objects
---

# Get Branch

Fetch a single branch by ID with human-readable ObjRef resolution.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Steps

### 1. Fetch the branch

Call `novadb_cms_get_branch`:

```json
{
  "id": "2100347"
}
```

Returns a `CmsObject` with `meta` and `values`.

### 2. Extract values

Parse the `values` array using these attribute IDs:

| Attribute | ID | Language | Description |
|-----------|------|----------|-------------|
| Name (EN) | 1000 | 201 | English display name |
| Name (DE) | 1000 | 202 | German display name |
| Parent | 4000 | 0 | Parent branch ID (ObjRef) |
| Type | 4001 | 0 | Branch type ID (ObjRef) |
| Workflow state | 4002 | 0 | State ID (ObjRef) |
| Due date | 4003 | 0 | ISO date string |
| Assigned to | 4004 | 0 | Username string |

### 3. Resolve ObjRef names (recommended)

Attributes 4000, 4001, and 4002 contain numeric object IDs. To get their display names, collect all non-null ObjRef values and fetch them in a single call:

Call `novadb_cms_get_objects`:

```json
{
  "branch": "branchDefault",
  "ids": "123,456,789",
  "attributes": "1000",
  "inherited": true
}
```

For each returned object, find the value with `attribute: 1000`, `language: 201` (English) to get the display name.

### 4. Present enriched result

Combine the branch data with resolved names:

```
Branch: My Feature Branch (ID: 2100500)
Parent: Main Branch (ID: 2100347)
Type: Feature (ID: 123)
State: In Progress (ID: 456)
Due: 2026-06-01
Assigned to: jdoe
```
