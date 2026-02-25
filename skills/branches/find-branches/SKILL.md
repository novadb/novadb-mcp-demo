---
name: find-branches
description: "Search for branches by name, assigned user, or parent using the Index API."
allowed-tools: novadb_index_search_objects, novadb_index_count_objects, novadb_index_object_occurrences
---

# Find Branches

Search for branches by name, assigned user, or parent using the Index API.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.
>
> Branch objects (typeRef 40) are system-level. Using `branch: "4"` (Default) returns **all branches** — results are complete.

## Tool

`novadb_index_search_objects`

## Parameters

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

- `branch` — Always use `"4"` (the Default branch that contains all branch objects)
- `objectTypeIds` — Always `[40]` (typeRef for branches)
- `searchPhrase` — (optional) Full-text search query
- `skip` / `take` — Pagination (defaults: skip=0, take=5)

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

## Get Total Count First (optional)

Call `novadb_index_count_objects` with the same branch and filter to know total before fetching:

```json
{
  "branch": "4",
  "filter": { "objectTypeIds": [40] }
}
```

Returns `{ count }`.

## Attribute Filters

Add `filters` array to the `filter` object for field-specific filtering:

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

## Response

Returns `{ objects, more, changeTrackingVersion }`.

Each object contains: `objectId`, `displayName`, `typeRef`, `modifiedBy`, `modified`, `deleted`, `hasDisplayName`.

When `more: true`, use `skip` + `take` to fetch the next page.

## Branch Statistics (optional)

Use `novadb_index_object_occurrences` to get faceted counts without fetching all data:

```json
{
  "branch": "4",
  "filter": { "objectTypeIds": [40] },
  "getModifiedByOccurrences": true
}
```

Returns counts per user who last modified branches — useful for dashboards.
