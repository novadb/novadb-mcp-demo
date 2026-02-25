# List Branches

List all branches. Choose quick mode (Index API) for an overview, or detailed mode (CMS API) for full attributes with resolved references.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Quick List (Index API) — recommended for overview

Fast single-call approach that returns ID, name, modifiedBy, and modified date.

### 1. Fetch all branches

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

### 2. Present results

Show a table with columns: ID, Name, Modified By, Modified.

Response shape: `{ objects, more, changeTrackingVersion }`. Each object has `objectId`, `displayName`, `modifiedBy`, `modified`, `deleted`.

---

## Detailed List (CMS API) — when full attributes are needed

Use this when you need parent, type, workflow state, due date, or assignedTo.

### 1. Fetch branches

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

- Use `branch: "branchDefault"` and `type: "typeBranch"` (special string identifiers)
- `attributes` filters to only branch-relevant attributes for efficiency
- `inherited: true` ensures inherited values are included
- `take: 100` fetches up to 100 branches; use `continue` token if more exist

### 2. Parse branch values

For each branch object, extract values using these attribute IDs:

| Attribute | ID | Language | Type |
|-----------|------|----------|------|
| Name (EN) | 1000 | 201 | String |
| Parent | 4000 | 0 | ObjRef (number) |
| Type | 4001 | 0 | ObjRef (number) |
| Workflow state | 4002 | 0 | ObjRef (number) |
| Due date | 4003 | 0 | DateTime.Date (string) |
| Assigned to | 4004 | 0 | String.UserName |

### 3. Resolve ObjRef names

Collect all numeric values from attributes 4000, 4001, and 4002 across all branches. Deduplicate, then fetch in one call:

Call `novadb_cms_get_objects`:

```json
{
  "branch": "branchDefault",
  "ids": "123,456,789",
  "attributes": "1000",
  "inherited": true
}
```

Match each resolved object's `meta.id` to the ObjRef values. The display name is in `attribute: 1000`, `language: 201`.

### 4. Present results

Show a table with columns: ID, Name, Parent, Type, State, Due Date, Assigned To.

Include the `continue` token if more pages exist.
