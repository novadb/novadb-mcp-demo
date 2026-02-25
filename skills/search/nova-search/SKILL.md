---
name: nova-search
description: "Index API search workflow and reference — parameters, filters, sorting, pagination, and ObjRef resolution."
user-invocable: false
allowed-tools: novadb_index_search_objects, novadb_index_count_objects, novadb_index_object_occurrences, novadb_cms_get_object, novadb_cms_get_objects
---

# NovaDB Search Reference

Step-by-step search workflow and complete Index API reference.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All numeric IDs in examples are samples — always use real IDs from the target system.

## Search Workflow

### 1. Count first (optional but recommended)

Get the total count before fetching results:

```json
{
  "branch": "2100347",
  "filter": {
    "objectTypeIds": [10],
    "searchPhrase": "company"
  }
}
```

Tool: `novadb_index_count_objects`. Response: `{ count }`.

### 2. Search

Fetch matching objects:

```json
{
  "branch": "2100347",
  "filter": {
    "objectTypeIds": [10],
    "searchPhrase": "company"
  },
  "sortBy": [{ "sortBy": 3 }],
  "skip": 0,
  "take": 20
}
```

Tool: `novadb_index_search_objects`.

### 3. Resolve ObjRef values

For each result that contains ObjRef values you want to display, batch-fetch the referenced objects:

```json
{
  "branch": "<branch>",
  "ids": "2100500,2100501,2100502",
  "attributes": "1000",
  "inherited": true
}
```

Tool: `novadb_cms_get_objects`. Match `meta.id` to the ObjRef values.

### 4. Present as table

Show results as a readable markdown table. Include ID, display name, and relevant resolved attributes.

---

## `novadb_index_search_objects` — Full Reference

```json
{
  "branch": "2100347",
  "filter": {
    "objectTypeIds": [10],
    "searchPhrase": "name",
    "filters": [
      {
        "attrId": 1001,
        "langId": 0,
        "variantId": 0,
        "value": "ObjRef",
        "compareOperator": 0
      }
    ]
  },
  "sortBy": [{ "sortBy": 3, "reverse": false }],
  "skip": 0,
  "take": 20
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `branch` | string | yes | **Numeric branch ID** (e.g. `"2100347"`). Never `"draft"` or `"branchDefault"`. |
| `filter` | object | no | Filter criteria (see below) |
| `sortBy` | array | no | Sort criteria (see below) |
| `skip` | number | no | Offset for pagination (default: 0) |
| `take` | number | no | Max results per page (default: 5) |

### Filter Object

| Field | Type | Description |
|-------|------|-------------|
| `objectTypeIds` | number[] | typeRef values to filter by (e.g. `[0]` for object types, `[10]` for attributes) |
| `searchPhrase` | string | Full-text search query |
| `filters` | array | Attribute-level filters (see below) |

### Attribute Filter Structure

```json
{
  "attrId": 1001,
  "langId": 0,
  "variantId": 0,
  "value": "ObjRef",
  "compareOperator": 0
}
```

| Field | Type | Description |
|-------|------|-------------|
| `attrId` | number | Attribute definition ID |
| `langId` | number | Language ID (0 for language-independent, 201 for EN, 202 for DE) |
| `variantId` | number | Variant ID (usually 0) |
| `value` | string | Value to compare (always a string, even for numbers/booleans) |
| `compareOperator` | number | Comparison operator (see table) |

### compareOperator Values

| Value | Meaning | Example use |
|-------|---------|-------------|
| 0 | Equal | Exact match on data type, boolean flags |
| 1 | NotEqual | Exclude specific values |
| 2 | GreaterThan | Date/number comparisons |
| 3 | LessThan | Date/number comparisons |
| 4 | Like | Partial string matching |
| 7 | ObjRefLookup | Find objects referencing a specific ID |

### sortBy Values

| Value | Field |
|-------|-------|
| 0 | Score (relevance) |
| 1 | Object ID |
| 3 | Display name |
| 4 | Modified date |
| 5 | Modified by |

Add `"reverse": true` to any entry for descending order.

### Response

```json
{
  "objects": [
    {
      "objectId": 2100500,
      "displayName": "Company Name",
      "typeRef": 10,
      "modifiedBy": "admin",
      "modified": "2025-01-15T10:30:00Z",
      "deleted": false,
      "hasDisplayName": true
    }
  ],
  "more": true,
  "changeTrackingVersion": 12345
}
```

When `more: true`, increment `skip` by `take` for the next page.

---

## `novadb_index_count_objects` — Reference

```json
{
  "branch": "2100347",
  "filter": {
    "objectTypeIds": [10],
    "searchPhrase": "name"
  }
}
```

Same `branch` and `filter` parameters as `search_objects`. Returns `{ count }`.

---

## `novadb_index_object_occurrences` — Reference

```json
{
  "branch": "2100347",
  "filter": { "objectTypeIds": [10] },
  "getModifiedByOccurrences": true,
  "getTypeRefOccurrences": true
}
```

Returns faceted counts — useful for understanding data distribution without fetching all objects.

---

## ObjRef Resolution via CMS

When search results contain objects with ObjRef attributes you need to display:

1. Fetch the full object: `novadb_cms_get_object` with `inherited: true`
2. Collect ObjRef IDs from the values
3. Batch-resolve: `novadb_cms_get_objects` with `ids` and `attributes: "1000"`
4. Match `meta.id` to the ObjRef values and display names

```json
{
  "branch": "<branch or 'draft'>",
  "ids": "2100500,2100501",
  "attributes": "1000",
  "inherited": true
}
```

---

## Application Area Discovery

To find object types by domain/theme, do NOT search object types directly — they have generic names. Instead:

1. Search Application Areas: `objectTypeIds: [60]`, `searchPhrase: "<theme>"`
2. Fetch the App Area with `novadb_cms_get_object` (include attr 6001)
3. Extract type IDs from attribute 6001 values
4. Fetch types with `novadb_cms_get_objects`

---

## Branch Parameter

The Index API always requires a **numeric branch ID string**:
- `"2100347"` — a specific branch
- `"4"` — the Default branch (contains all system objects like branches, types)

Never use `"draft"`, `"branchDefault"`, or other named identifiers with the Index API. Index results are scoped to the specified branch — objects from other branches will not appear.
