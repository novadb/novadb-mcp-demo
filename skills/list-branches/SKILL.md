---
name: nova-list-branches
description: "Branch listing reference — quick Index API overview vs detailed CMS API with resolved references."
user-invocable: false
allowed-tools: novadb_index_search_objects, novadb_cms_get_typed_objects, novadb_cms_get_objects
---

# List Branches Reference

## Scope

**This skill is EXCLUSIVELY a reference for:** Listing and identifying available NovaDB branches — both quick overview (Index API) and detailed listing (CMS API) approaches.

**For searching/filtering branches by criteria** → see `find-branches` skill
**For fetching a single branch by ID** → see `get-branch` skill

Two approaches for listing branches: quick overview (Index API) or detailed listing (CMS API) with fully resolved references.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All numeric IDs in examples are samples — always use real IDs from the target system.

## Quick List (Index API) — recommended for overview

Fast single-call approach that returns ID, name, modifiedBy, and modified date.

### Fetch all branches

Call `novadb_index_search_objects`:

```json
{
  "branch": "4",
  "filter": { "objectTypeIds": [40] },
  "sortBy": [{ "sortBy": 3 }],
  "take": 100
}
```

- `branch` — Always `"4"` (Default branch, contains all branch objects)
- `objectTypeIds` — Always `[40]` (typeRef for branches)
- `sortBy` — `3` = sort by display name alphabetically
- `take` — `100` is enough for most systems; if `more: true`, use `skip` for next page

### Response

```json
{
  "objects": [
    {
      "objectId": 2100347,
      "displayName": "My Branch",
      "typeRef": 40,
      "modifiedBy": "admin",
      "modified": "2025-01-15T10:30:00Z",
      "deleted": false,
      "hasDisplayName": true
    }
  ],
  "more": false,
  "changeTrackingVersion": 12345
}
```

### Present results

Show a table with columns: **ID, Name, Modified By, Modified**.

---

## Detailed List (CMS API) — when full attributes are needed

Use this when you need parent, type, workflow state, due date, or assigned user.

### Step 1: Fetch branches

Call `novadb_cms_get_typed_objects`:

```json
{
  "branch": "branchDefault",
  "type": "typeBranch",
  "attributes": "1000,4000,4001,4002,4003,4004",
  "inherited": true,
  "take": 100
}
```

- `branch: "branchDefault"` and `type: "typeBranch"` — special string identifiers
- `attributes` — Filters to only branch-relevant attributes for efficiency
- `inherited: true` — Ensures inherited values are included
- `take: 100` — Fetches up to 100 branches; use `continue` token if more exist

### Step 2: Parse branch values

For each branch object, extract values using these attribute IDs:

| Attribute | ID | Language | Type |
|-----------|------|----------|------|
| Name (EN) | 1000 | 201 | String |
| Parent | 4000 | 0 | ObjRef (number) |
| Type | 4001 | 0 | ObjRef (number) |
| Workflow state | 4002 | 0 | ObjRef (number) |
| Due date | 4003 | 0 | DateTime.Date (string) |
| Assigned to | 4004 | 0 | String.UserName |

### Step 3: Resolve ObjRef names

Collect all numeric values from attributes 4000, 4001, and 4002 across all branches. Deduplicate, then fetch in one call:

```json
{
  "branch": "branchDefault",
  "ids": "2100500,2100501,2100502",
  "attributes": "1000",
  "inherited": true
}
```

Tool: `novadb_cms_get_objects`. Match each resolved object's `meta.id` to the ObjRef values. The display name is in `attribute: 1000`, `language: 201`.

### Step 4: Present results

Show a table with columns: **ID, Name, Parent, Type, State, Due Date, Assigned To**.

Include the `continue` token if more pages exist.

---

## Pagination

### Index API

Uses `skip` / `take`:
- When `more: true`, increment `skip` by `take` for the next page
- Default `take` is 5 — use higher values (50–100) for branch listing

### CMS API

Uses `continue` token:
- Response includes a `continue` string when more results exist
- Pass it as the `continue` parameter in the next call
- Stop when no `continue` token is returned
