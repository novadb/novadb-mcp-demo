# Find Branches

Search for branches by name, assigned user, or parent using the Index API.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_index_search_objects`

## Parameters

```json
{
  "branch": "4",
  "objectTypeIds": [40],
  "searchPhrase": "My Branch",
  "skip": 0,
  "take": 5
}
```

- `branch` — Always use `"4"` for the Index API branch that contains branch objects
- `objectTypeIds` — Always `[40]` (typeRef for branches)
- `searchPhrase` — (optional) Full-text search query
- `skip` / `take` — Pagination (defaults: skip=0, take=5)

## Attribute Filters

Add `filters` array for field-specific filtering:

### Filter by assigned user

```json
{
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
```

`compareOperator: 0` = Equal

### Filter by parent branch

```json
{
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
```

`compareOperator: 7` = Reference filter (for ObjRef hierarchy)

### Combined example

```json
{
  "branch": "4",
  "objectTypeIds": [40],
  "searchPhrase": "feature",
  "filters": [
    { "attrId": 4004, "langId": 0, "variantId": 0, "value": "jdoe", "compareOperator": 0 },
    { "attrId": 4000, "langId": 0, "variantId": 0, "value": "2100347", "compareOperator": 7 }
  ],
  "skip": 0,
  "take": 10
}
```

## Response

Returns `{ objects, totalCount }` with matching branch summaries (objectId, displayName, etc.).

## Limitation: Branch-Scoped Results

The Index API returns branch-scoped results. This works well for filtered searches (by name, assignee, parent), but may not include every branch. For a complete list of all branches, use the `list-branches` skill (`novadb_cms_get_typed_objects` with `branch: "branchDefault"`, `type: "typeBranch"`).
