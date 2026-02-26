---
name: create-branch
description: "Create a new branch (work package) in NovaDB."
user-invocable: false
allowed-tools: novadb_cms_create_branch
---

# Create Branch

Create a new branch (work package) in NovaDB.

## Scope

**This skill ONLY handles:** Creating a new branch (work package) in NovaDB.

**For updating existing branches** → use `update-branch`

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_cms_create_branch`

## Parameters

- `values` — Array of `CmsValue` objects (see below)
- `comment` — (optional) Audit trail comment
- `username` — (optional) Acting username for audit

## Branch Attribute IDs

| Attribute      | ID   | Type            | Notes                                                       |
| -------------- | ---- | --------------- | ----------------------------------------------------------- |
| Name (EN)      | 1000 | String          | `language: 201`, `variant: 0`                               |
| Name (DE)      | 1000 | String          | `language: 202`, `variant: 0`                               |
| Parent branch  | 4000 | ObjRef          | `language: 0`, `variant: 0`                                 |
| Branch type    | 4001 | ObjRef          | `language: 0`, `variant: 0`                                 |
| Workflow state | 4002 | ObjRef          | `language: 0`, `variant: 0`                                 |
| Due date       | 4003 | DateTime.Date   | `language: 0`, `variant: 0`, ISO format e.g. `"2026-03-01"` |
| Assigned to    | 4004 | String.UserName | `language: 0`, `variant: 0`                                 |

## Value Construction

Build a `values` array with one entry per field. Only include fields you want to set.

```json
{
  "values": [
    { "attribute": 1000, "language": 201, "variant": 0, "value": "My Branch" },
    { "attribute": 1000, "language": 202, "variant": 0, "value": "Mein Zweig" },
    { "attribute": 4000, "language": 0, "variant": 0, "value": 2100347 },
    { "attribute": 4001, "language": 0, "variant": 0, "value": 123 },
    { "attribute": 4002, "language": 0, "variant": 0, "value": 456 },
    { "attribute": 4003, "language": 0, "variant": 0, "value": "2026-06-01" },
    { "attribute": 4004, "language": 0, "variant": 0, "value": "jdoe" }
  ],
  "comment": "Created via AI assistant"
}
```

## Response

Returns the created branch as a `CmsObject` with `meta` (id, guid, typeRef) and `values`.

## Minimum Required

Only `nameEn` (attribute 1000, language 201) is semantically required. All other fields are optional.

## Common Patterns

### CmsValue Format
Every value entry follows: `{ attribute, language, variant, value, sortReverse? }`
- `language`: 201=EN, 202=DE, 0=language-independent
- `variant`: 0=default

### API Response (Create Branch)
Returns the created branch as a `CmsObject` with `meta` and `values`.
