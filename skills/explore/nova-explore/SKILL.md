---
name: nova-explore
description: "Schema browsing API reference — tools, parameters, attribute ID tables, pagination, and type discovery."
user-invocable: false
allowed-tools: novadb_cms_get_object, novadb_cms_get_objects, novadb_cms_get_typed_objects, novadb_cms_get_branch, novadb_index_search_objects, novadb_index_count_objects, novadb_index_object_occurrences, novadb_index_suggestions, novadb_index_match_strings
---

# NovaDB Schema Exploration Reference

## Scope

**This skill is EXCLUSIVELY a reference for:** Read-only NovaDB schema browsing — object types, attribute definitions, forms, application areas, and configuration discovery.

**For searching data objects** → see `nova-search` skill
**For form configuration** → see `nova-forms` skill
**For branch listing** → see `nova-list-branches` skill

Full API reference for read-only schema browsing. All tools, parameters, attribute tables, and discovery strategies.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All numeric IDs in examples are samples — always use real IDs from the target system.

## Available Tools

### CMS API (read)

| Tool | Purpose |
|------|---------|
| `novadb_cms_get_object` | Fetch a single object by ID, GUID, or ApiIdentifier |
| `novadb_cms_get_objects` | Fetch multiple objects by comma-separated IDs |
| `novadb_cms_get_typed_objects` | Browse objects by type (schema browsing) |
| `novadb_cms_get_branch` | Fetch branch metadata |

### Index API (search)

| Tool | Purpose |
|------|---------|
| `novadb_index_search_objects` | Full-text search with filters, sorting, pagination |
| `novadb_index_count_objects` | Count matching objects without fetching |
| `novadb_index_object_occurrences` | Faceted counts (e.g. per type, per modifier) |
| `novadb_index_suggestions` | Autocomplete / typeahead suggestions |
| `novadb_index_match_strings` | Find matching string values for an attribute |

---

## CMS Tool Parameters

### `novadb_cms_get_object`

```json
{
  "branch": "<branchId or 'draft'>",
  "objectId": "<id, guid, or apiIdentifier>",
  "inherited": true,
  "attributes": "1000,1001,1012"
}
```

- `inherited` — Always use `true` to include inherited values
- `attributes` — Optional comma-separated list to filter returned attributes

### `novadb_cms_get_objects`

```json
{
  "branch": "<branchId or 'draft'>",
  "ids": "2100500,2100501,2100502",
  "inherited": true,
  "attributes": "1000"
}
```

- `ids` — Comma-separated object IDs (batch fetch)

### `novadb_cms_get_typed_objects`

```json
{
  "branch": "branchDefault",
  "type": "typeObjectType",
  "inherited": true,
  "attributes": "1000,1012,1021",
  "take": 100
}
```

- `branch` — Use `"branchDefault"` for schema objects, or a numeric branch ID
- `type` — Special string identifiers (see below) or a numeric typeRef
- `take` — Max objects per page (default varies)
- `continue` — Pagination token from previous response

**Special `type` identifiers:**

| Identifier | Description |
|------------|-------------|
| `branchDefault` | The default branch (use as `branch` value) |
| `typeBranch` | Branch objects (typeRef 40) |
| `typeObjectType` | Object type definitions (typeRef 0) |
| `typeAttributeDefinition` | Attribute definitions (typeRef 10) |
| `typeForm` | Form definitions (typeRef 50) |
| `typeApplicationArea` | Application areas (typeRef 60) |

### `novadb_cms_get_branch`

```json
{
  "branch": "<branchId>"
}
```

Returns branch metadata including name, parent, type, state.

---

## Index Tool Parameters

### `novadb_index_search_objects`

```json
{
  "branch": "2100347",
  "filter": {
    "objectTypeIds": [0],
    "searchPhrase": "Company"
  },
  "sortBy": [{ "sortBy": 3 }],
  "skip": 0,
  "take": 20
}
```

- `branch` — **Numeric string only** (e.g. `"2100347"`). Never `"draft"` or `"branchDefault"`.
- `filter.objectTypeIds` — Array of typeRef values to filter by
- `filter.searchPhrase` — Full-text search query
- `filter.filters` — Attribute-level filters (see Filter section below)
- `sortBy` — Array of sort criteria
- `skip` / `take` — Pagination (defaults: skip=0, take=5)

**Response:** `{ objects, more, changeTrackingVersion }`. Each object has `objectId`, `displayName`, `typeRef`, `modifiedBy`, `modified`.

When `more: true`, increment `skip` by `take` for the next page.

### `novadb_index_count_objects`

```json
{
  "branch": "2100347",
  "filter": { "objectTypeIds": [10] }
}
```

**Response:** `{ count }`

### `novadb_index_object_occurrences`

```json
{
  "branch": "2100347",
  "filter": { "objectTypeIds": [10] },
  "getModifiedByOccurrences": true
}
```

Returns faceted counts — useful for overview statistics.

### Attribute Filters

Add `filters` array inside `filter`:

```json
{
  "filter": {
    "objectTypeIds": [10],
    "filters": [
      {
        "attrId": 1001,
        "langId": 0,
        "variantId": 0,
        "value": "ObjRef",
        "compareOperator": 0
      }
    ]
  }
}
```

**compareOperator values:**

| Value | Meaning |
|-------|---------|
| 0 | Equal |
| 1 | NotEqual |
| 2 | GreaterThan |
| 3 | LessThan |
| 4 | Like |
| 7 | ObjRefLookup |

### sortBy values

| Value | Field |
|-------|-------|
| 0 | Score (relevance) |
| 1 | Object ID |
| 3 | Display name |
| 4 | Modified date |
| 5 | Modified by |

Add `"reverse": true` to any entry for descending order.

---

## CmsValue Structure

Every object value follows this format:

```typescript
{
  attribute: number,   // Attribute definition ID
  language: number,    // Language ID (201=EN, 202=DE, 0=language-independent)
  variant: number,     // Variant axis (0=default)
  value: unknown,      // The actual value
  sortReverse?: number // Multi-value ordering (0, 1, 2, ...)
}
```

---

## typeRef Constants

| typeRef | Description | Use in `get_typed_objects` |
|---------|-------------|---------------------------|
| 0 | Object types | `type: "typeObjectType"` |
| 10 | Attribute definitions | `type: "typeAttributeDefinition"` |
| 40 | Branches | `type: "typeBranch"` |
| 50 | Forms | `type: "typeForm"` |
| 60 | Application areas | `type: "typeApplicationArea"` |

---

## Universal Attributes

Apply to all object types.

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Name | 1000 | String | Language-dependent (201=EN, 202=DE) |
| Description | 1012 | String | Language-dependent |
| API Identifier | 1021 | String | Language-independent |

---

## Object Type Attributes (typeRef=0)

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Create form | 5001 | ObjRef | Single form reference |
| Detail forms | 5002 | ObjRef | Multi-value with `sortReverse` |
| Display name attribute | 5005 | ObjRef | Which attribute serves as display name |
| Binary proxy | 5009 | Boolean | |

---

## Attribute Definition Attributes (typeRef=10)

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Data type | 1001 | String.DataType | See DATA_TYPE_ENUM |
| Variant axis | 1002 | ObjRef | |
| Unit of measure | 1003 | ObjRef | NOT attribute definitions |
| Allow multiple | 1004 | Boolean | |
| Max values | 1014 | Integer | 1=single, 0=unlimited |
| Allowed types | 1015 | ObjRef | Multi-value, for ObjRef data type |
| Language dependent | 1017 | Boolean | |
| Required | 1018 | Boolean | |
| Virtual | 1020 | Boolean | Computed attribute |
| Reverse relation name | 1051 | String | Language-dependent |

**DATA_TYPE_ENUM values:**
```
String, TextRef, TextRef.JavaScript, TextRef.CSS,
XmlRef.SimpleHtml, XmlRef.VisualDocument,
Integer, Decimal, Float, Boolean,
DateTime, DateTime.Date,
ObjRef, BinRef, BinRef.Icon, BinRef.Thumbnail,
String.DataType, String.InheritanceBehavior, String.UserName, String.RGBColor
```

---

## Form Attributes (typeRef=50)

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Form content (fields) | 5053 | ObjRef | Multi-value with `sortReverse` |
| Condition attribute | 5054 | ObjRef | Single |
| Condition refs | 5055 | ObjRef | Multi-value |
| Is single editor | 5056 | Boolean | |

---

## Branch Attributes (typeRef=40)

| Attribute | ID | Type |
|-----------|------|------|
| Parent branch | 4000 | ObjRef |
| Branch type | 4001 | ObjRef |
| Workflow state | 4002 | ObjRef |
| Due date | 4003 | DateTime.Date |
| Assigned to | 4004 | String.UserName |

---

## Application Area Attributes (typeRef=60)

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Object types | 6001 | ObjRef | Multi-value — the types in this area |
| Sort key | 6003 | Integer | Display ordering |

---

## Type → Form → Attribute Chain

There is NO direct link from object types to attribute definitions. The chain is:

```
Object Type (typeRef=0)
  → Create Form (attr 5001, single ObjRef)
  → Detail Forms (attr 5002, multi-value ObjRef)
    → Form Content (attr 5053, multi-value ObjRef)
      → Attribute Definitions (typeRef=10)
```

To discover which attributes belong to a type:
1. Fetch the type with `get_object` (include attrs 5001, 5002)
2. Collect form IDs from 5001 and 5002 values
3. Fetch forms with `get_objects` (include attr 5053)
4. Collect attribute definition IDs from 5053 values
5. Fetch attribute definitions with `get_objects`

---

## Application Area Discovery Strategy

To find object types by domain or theme:

1. Search Application Areas: `novadb_index_search_objects` with `objectTypeIds: [60]` and the theme name as `searchPhrase`
2. Fetch the matching App Area with `novadb_cms_get_object` (include attr 6001)
3. Extract type IDs from 6001 values
4. Fetch those types with `novadb_cms_get_objects`

Do NOT search object types (typeRef=0) by theme name — types have generic names (e.g. "Character", not "Star Wars"). Application Areas provide the thematic grouping.

---

## ObjRef Resolution Pattern

When CmsValue entries contain numeric ObjRef values:

1. Collect all unique ObjRef IDs across the objects
2. Batch-fetch with `novadb_cms_get_objects`:
   ```json
   {
     "branch": "<branch>",
     "ids": "2100500,2100501,2100502",
     "attributes": "1000",
     "inherited": true
   }
   ```
3. Match each resolved object's `meta.id` to the original ObjRef values
4. Display the name (attribute 1000, language 201) instead of the bare numeric ID

---

## Pagination

### CMS API

Uses `continue` token:
- Response includes a `continue` string when more results exist
- Pass it as the `continue` parameter in the next call
- Stop when no `continue` token is returned

### Index API

Uses `skip` / `take`:
- Response includes `more: true` when more results exist
- Increment `skip` by `take` for the next page
- Default `take` is 5 — increase for larger batches
