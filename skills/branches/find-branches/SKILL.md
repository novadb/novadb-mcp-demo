---
name: nova-find-branches
description: "Search and filter branches via the Index API."
user-invocable: false
allowed-tools: novadb_index_search_objects, novadb_index_count_objects, novadb_index_object_occurrences
---

# Find Branches Reference

Search for branches by name, assigned user, parent, or other criteria using the Index API.

## Scope

**This skill ONLY handles:** Searching and filtering branches by criteria (name, assignee, parent, state) via the Index API.

**For a quick overview of all branches** → use `list-branches`
**For fetching a single branch by ID** → use `get-branch`

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All numeric IDs in examples are samples — always use real IDs from the target system.
>
> Branch objects (typeRef 40) are system-level. Using `branch: "4"` (Default) returns **all branches** — results are complete.

## Count First (recommended)

Get the total count before fetching results:

```json
{
  "branch": "4",
  "filter": { "objectTypeIds": [40] }
}
```

Tool: `novadb_index_count_objects`. Response: `{ count }`.

---

## Search

Call `novadb_index_search_objects`:

```json
{
  "branch": "4",
  "filter": {
    "objectTypeIds": [40],
    "searchPhrase": "My Branch"
  },
  "skip": 0,
  "take": 20
}
```

- `branch` — Always `"4"` (the Default branch that contains all branch objects)
- `objectTypeIds` — Always `[40]` (typeRef for branches)
- `searchPhrase` — (optional) Full-text search query
- `skip` / `take` — Pagination (defaults: skip=0, take=5)

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

When `more: true`, increment `skip` by `take` for the next page.

---

## Sorting

Add `sortBy` for ordered results:

```json
{
  "sortBy": [{ "sortBy": 3 }]
}
```

| sortBy | Field |
|--------|-------|
| 0 | Score (relevance) |
| 1 | Object ID |
| 3 | Display name |
| 4 | Modified date |
| 5 | Modified by |

Add `"reverse": true` to any entry for descending order.

---

## Attribute Filters

Add `filters` array to the `filter` object for field-specific filtering.

### Filter by assigned user

```json
{
  "branch": "4",
  "filter": {
    "objectTypeIds": [40],
    "filters": [
      {
        "attrId": 4004,
        "langId": 0,
        "variantId": 0,
        "value": "jdoe",
        "compareOperator": 0
      }
    ]
  }
}
```

`compareOperator: 0` = Equal

### Filter by parent branch

```json
{
  "branch": "4",
  "filter": {
    "objectTypeIds": [40],
    "filters": [
      {
        "attrId": 4000,
        "langId": 0,
        "variantId": 0,
        "value": "2100347",
        "compareOperator": 7
      }
    ]
  }
}
```

`compareOperator: 7` = ObjRef lookup (for reference hierarchy)

### Combined example

```json
{
  "branch": "4",
  "filter": {
    "objectTypeIds": [40],
    "searchPhrase": "feature",
    "filters": [
      { "attrId": 4004, "langId": 0, "variantId": 0, "value": "jdoe", "compareOperator": 0 },
      { "attrId": 4000, "langId": 0, "variantId": 0, "value": "2100347", "compareOperator": 7 }
    ]
  },
  "sortBy": [{ "sortBy": 3 }],
  "skip": 0,
  "take": 20
}
```

### compareOperator Values

| Value | Meaning |
|-------|---------|
| 0 | Equal |
| 1 | NotEqual |
| 2 | GreaterThan |
| 3 | LessThan |
| 4 | Like |
| 7 | ObjRefLookup |

---

## Branch Statistics

Use `novadb_index_object_occurrences` to get faceted counts without fetching all data:

```json
{
  "branch": "4",
  "filter": { "objectTypeIds": [40] },
  "getModifiedByOccurrences": true
}
```

Returns counts per user who last modified branches — useful for dashboards and summaries.

## Common Patterns

### Index API Branch Parameter
The Index API requires a **numeric branch ID**. Use `"4"` (Default branch) to search all branches since branches are stored in the default branch.

### API Response (Index Search)
Returns `{ totalCount, items: [{ id, values: { name, ... } }] }`. Use `skip` and `take` for pagination.
