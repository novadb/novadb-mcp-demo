---
name: nova-import-data
description: Imports and creates data objects in NovaDB via the CMS API. Use when the user wants to create objects, bulk import data, update existing records, or migrate content into Nova.
---
You have access to the NovaDB MCP server tools. This skill guides you through importing and creating data objects via the CMS API.

## CMS API Value Format

The CMS API uses **normalized value tuples**, not flat key-value props:

```json
{ "values": [{ "attribute": 1000, "language": 201, "variant": 0, "value": "Example" }] }
```

- `attribute` — Numeric attribute definition ID (not apiIdentifier string)
- `language` — Language ID (0 for language-independent; 201=en-US, 202=de-DE)
- `variant` — Variant ID (0 for no variant)

## Pre-Import: Discover the Schema

Before creating objects, discover the target type's attributes:

```
# 1. Find the target type
novadb_cms_get_typed_objects(branch, type="root")

# 2. Get a sample object to understand its structure
novadb_cms_get_typed_objects(branch, type="<typeApiIdentifier>", take=1)

# 3. For detailed attribute info, fetch an attribute definition
novadb_cms_get_object(branch, id=<attrDefId>, inherited=true)

# 4. Get the type's forms to see which attributes are used
novadb_cms_get_object(branch, id=<typeId>, inherited=true)
# Find objectTypeDetailForms (attribute 5002) — array of form IDs
# Then fetch the forms to see formContent (attribute 5053)
novadb_cms_get_objects(branch, ids="<formId1>,<formId2>")
```

## Value Formatting by Data Type

| Data Type | CMS Value Format | Example |
|-----------|-----------------|---------|
| `String` | String | `"Hello World"` |
| `TextRef` | String | `"Long description text"` |
| `Integer` | Number | `42` |
| `Decimal` | Number | `3.14` |
| `Boolean` | Boolean | `true` |
| `DateTime.Date` | ISO date string | `"2026-01-08"` |
| `ObjRef` (single) | Number | `2099001` |
| `ObjRef` (multi) | Array of numbers | `[2099001, 2099002]` |
| `XmlRef.SimpleHtml` | Object with XML key | `{"XML": "<p>Hello</p>"}` |
| `String.DataType` | Enum string | `"ObjRef"` |
| `String.InheritanceBehavior` | Enum string | `"None"` |
| `String.UserName` | String | `"john.doe"` |

## Language-Dependent Values

For language-dependent attributes, provide one value tuple per language:

```json
{
  "values": [
    { "attribute": 1000, "language": 201, "value": "English Name" },
    { "attribute": 1000, "language": 202, "value": "Deutscher Name" },
    { "attribute": 1012, "language": 201, "value": "English description" },
    { "attribute": 1012, "language": 202, "value": "Deutsche Beschreibung" }
  ]
}
```

Language-independent attributes use `language: 0`:
```json
{ "attribute": <attrId>, "language": 0, "value": true }
```

## Workflow: Import Objects

### Step 1: Identify the Target Type

Discover available types:
```
novadb_cms_get_typed_objects(branch="branchDefault", type="root")
```

Note the `id` (typeRef) and `apiIdentifier` of the target type.

### Step 2: Discover the Schema

```
novadb_cms_get_typed_objects(branch, type="<apiIdentifier>", take=2)
```

Examine the `values` to understand which attributes exist. The `attribute` field contains the numeric attribute definition ID.

### Step 3: Prepare Objects

Structure each object with `meta.typeRef` and a `values` array:

```json
{
  "meta": { "typeRef": <typeId>, "apiIdentifier": "optionalUniqueId" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "Object Name (EN)" },
    { "attribute": 1000, "language": 202, "value": "Objektname (DE)" },
    { "attribute": <attrId>, "value": <value> }
  ]
}
```

### Step 4: Create Objects

```json
novadb_cms_create_objects(branch="branchDefault", objects=[
  { "meta": { "typeRef": <typeId> }, "values": [...] },
  { "meta": { "typeRef": <typeId> }, "values": [...] }
], comment="Imported via MCP")
```

The response returns `createdObjectIds` — save these for verification or follow-up updates.

### Step 5: Verify

```
novadb_cms_get_object(branch, id=<createdId>, inherited=true)
```

Check that all values are set correctly, especially language-dependent values.

### Step 6: Handle Updates

To update existing objects:

```json
novadb_cms_update_objects(branch, objects=[{
  "meta": { "id": <existingId>, "typeRef": <typeId> },
  "values": [
    { "attribute": <attrId>, "language": 201, "value": "Updated value" }
  ]
}], comment="Updated via MCP")
```

Only provided values are changed — omitted attributes keep their existing values.

## Bulk Import Tips

- **Batch size:** `create_objects` accepts multiple objects in a single call. Group them for efficiency (up to ~50 per call is reasonable).
- **apiIdentifier:** Set at creation time if needed — it's immutable after creation. Useful for referencing objects by name later.
- **ObjRef values:** Must reference existing objects. If importing related data, create referenced objects first (e.g., categories before products).
- **Idempotency:** There is no upsert. Before re-importing, check if objects already exist using `novadb_index_suggestions` or `novadb_index_search_objects`.

## Universal Attributes

These attributes are present on most objects:

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 1000 | `attributeName` | String | Object name (language-dependent) |
| 1012 | `attributeDescription` | TextRef | Description (language-dependent) |
| 1016 | `attributeIcon` | BinRef.Icon | Small icon |
| 1021 | `attributeApiIdentifier` | String | API identifier (unique) |

## Gotchas

- **CMS uses numeric attribute IDs**, not apiIdentifier strings. Discover IDs by examining existing objects or attribute definitions.
- **`apiIdentifier` is immutable** — Set in `meta.apiIdentifier` at creation time. Cannot be changed later (HTTP 403). If wrong, delete and recreate.
- **`update_objects` requires `meta.typeRef`** — Always include the typeRef even when updating.
- **Language-dependent values** need one tuple per language. Omitting a language leaves that language's value unchanged (on update) or empty (on create).
- **ObjRef order matters** for multi-references — the array order is preserved and may be significant (e.g., `formContent` display order).
- **Pagination:** CMS `get_typed_objects` uses `continue` token, not `skip`/`take`. Check for continuation tokens in responses.
- **Use `inherited=true`** when reading objects to see all values including inherited ones.
