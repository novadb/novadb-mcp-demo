---
name: search-attributes
description: "Search attribute definitions by name, data type, or flags using the Index API."
allowed-tools: mcp__novadb__novadb_index_search_objects, novadb_index_search_objects
---

# Search Attributes

Search attribute definitions by name, data type, or flags using the Index API.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_index_search_objects`

## Parameters

```json
{
  "branch": "2100347",
  "objectTypeIds": [10],
  "searchPhrase": "name",
  "skip": 0,
  "take": 5
}
```

- `branch` — Branch ID as a **numeric string** (e.g. `"2100347"`). The Index API does not accept `"draft"` — use a numeric branch ID.
- `objectTypeIds` — Always `[10]` (typeRef for attribute definitions)
- `searchPhrase` — (optional) Full-text search query
- `skip` / `take` — Pagination (defaults: skip=0, take=5)

## Attribute Filters

Add `filters` array for field-specific filtering. All use `compareOperator: 0` (Equal).

### Filter by data type

```json
{
  "filters": [
    { "attrId": 1001, "langId": 0, "variantId": 0, "value": "ObjRef", "compareOperator": 0 }
  ]
}
```

### Filter by inheritance behavior

```json
{
  "filters": [
    { "attrId": 1013, "langId": 0, "variantId": 0, "value": "Inheriting", "compareOperator": 0 }
  ]
}
```

Valid values: `"None"`, `"Inheriting"`, `"InheritingAll"`

### Filter by boolean flags

Boolean values must be passed as strings (`"true"` / `"false"`):

| Flag | Attr ID |
|------|---------|
| Virtual | 1020 |
| Required | 1018 |
| Language dependent | 1017 |

```json
{
  "filters": [
    { "attrId": 1020, "langId": 0, "variantId": 0, "value": "true", "compareOperator": 0 }
  ]
}
```

### Combined example

Search for required ObjRef attributes:

```json
{
  "branch": "2100347",
  "objectTypeIds": [10],
  "searchPhrase": "company",
  "filters": [
    { "attrId": 1001, "langId": 0, "variantId": 0, "value": "ObjRef", "compareOperator": 0 },
    { "attrId": 1018, "langId": 0, "variantId": 0, "value": "true", "compareOperator": 0 }
  ],
  "skip": 0,
  "take": 10
}
```

## Response

Returns `{ objects, totalCount }` with matching attribute summaries.

## Data Type Enum (for filter values)

```
String, TextRef, TextRef.JavaScript, TextRef.CSS,
XmlRef.SimpleHtml, XmlRef.VisualDocument,
Integer, Decimal, Float, Boolean,
DateTime, DateTime.Date,
ObjRef, BinRef, BinRef.Icon, BinRef.Thumbnail,
String.DataType, String.InheritanceBehavior, String.UserName, String.RGBColor
```

## Pitfall: Branch-Scoped Results

Index API results are scoped to the specified branch. Attribute definitions created in a different branch may not appear. If results seem incomplete, use `novadb_cms_get_typed_objects` with `type: "typeAttributeDefinition"` to browse all attributes via the CMS API instead.
