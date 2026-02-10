# NovaDB MCP Plugin

## Session Start

**At the beginning of every new session, ask the user which NovaDB branch they want to work in.** Discover available branches via `novadb_cms_get_typed_objects(branch="branchDefault", type="typeBranch")` and present them as options. Use the selected branch for all subsequent API calls unless the user explicitly switches.

---

This plugin provides access to a NovaDB instance via two APIs:
- **Index API** (`novadb_index_*`) — Full-text search, structured filters, faceted counts, comment search. **Preferred for finding and filtering data.**
- **CMS API** (`novadb_cms_*`) — Object CRUD (create/read/update/delete), comments, job management. Use for fetching specific objects by ID and for all write operations.

## Skills

Use these skills for focused workflows:
- `/nova-explore` — Browse, query, filter, and search Nova data (CMS + Index APIs)
- `/nova-search` — Find objects by text, attributes, or type (Index API)
- `/nova-list-branches` — List available branches with resolved references
- `/nova-create-type` — Create object types, attribute definitions, and forms
- `/nova-forms` — Create and edit forms (UI layout definitions). Agent: `nova-forms`
- `/nova-import-data` — Import and create data objects via CMS API
- `/nova-branches` — Create, update, delete, and inspect branches (work packages)

## Nova Data Model

### Core Hierarchy

```
Branch (Work Package)
  └── Objects (each belongs to exactly one Object Type)
        └── Values (attribute/language/variant tuples, defined by Attribute Definitions)
```

- **Branches** are isolated data partitions. Discover branches with `novadb_cms_get_typed_objects(branch="branchDefault", type="typeBranch")`.
- **Object Types** define schemas. Discover per branch with `novadb_cms_get_typed_objects(branch, type="root")`.
- **Objects** have a numeric `id`, `guid`, optional `apiIdentifier`, and `typeRef` pointing to their type.

### Object ID Ranges

| Range | Content |
|-------|---------|
| **0 – ~1300** | Core system objects (types, attributes, languages, units) |
| **2097152 (2^21)** | Boundary — `Nova.Bootstrap` package |
| **~2097152 – ~2098xxx** | Installed packages (forms, media types, countries) |
| **~2098xxx+** | Customer-defined types and business data |

### Object Structure (CMS API)

The CMS API returns normalized value tuples:

```json
{
  "meta": {
    "id": 2099001, "guid": "7e70dbfd-...", "apiIdentifier": "optionalId",
    "typeRef": 2098900, "lastTransaction": 42, "deleted": false
  },
  "values": [
    { "attribute": 1000, "language": 201, "variant": 0, "value": "Example Product" },
    { "attribute": 1000, "language": 202, "variant": 0, "value": "Beispielprodukt" },
    { "attribute": 2098950, "language": 0, "variant": 0, "value": 2099050 }
  ]
}
```

- `attribute` — Numeric attribute definition ID
- `language` — Language ID (0 for language-independent; 201=en-US, 202=de-DE)
- `variant` — Variant ID (0 for no variant)
- Use `inherited=true` to include inherited values

### References (ObjRef)

References link objects via numeric IDs. Single: `"value": 2099001`. Multi: `"value": [2099001, 2099002]`.

To resolve references, fetch the referenced objects with a separate CMS call:
```
# 1. Fetch the object
novadb_cms_get_object(branch, id=<objectId>)
# 2. Find ObjRef values in the response (numeric IDs or arrays of IDs)
# 3. Fetch referenced objects
novadb_cms_get_objects(branch, ids="<refId1>,<refId2>,...")
```

### Localization

Two languages available: en-US (201, `languageEnglishUS`) and de-DE (202, `languageGermanGermany`). The CMS API returns all language values at once. Use the `languages` parameter to filter to specific languages.

### Key System Types

| ID | apiIdentifier | Name |
|----|--------------|------|
| 0 | `root` | Object Type (meta-type) |
| 10 | `typeAttribute` | Attribute Definition |
| 20 | `typeLanguage` | Language |
| 30 | `typeUnit` | Unit of Measure |
| 40 | `typeBranch` | Work Package (branch) |
| 50 | `typeForm` | Form Definition |
| 60 | `typeApplicationArea` | Application Area |

### Universal Attributes

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 1000 | `attributeName` | String | Object name (language-dependent) |
| 1012 | `attributeDescription` | TextRef | Description (language-dependent) |
| 1016 | `attributeIcon` | BinRef.Icon | Small icon |
| 1021 | `attributeApiIdentifier` | String | API identifier (unique) |

## API Overview

**CMS API** — Read/write. Uses normalized value tuples:
```json
{ "values": [{ "attribute": 1000, "language": 201, "variant": 0, "value": "Example" }] }
```
Read operations: `get_object`, `get_objects`, `get_typed_objects` (cursor-based pagination with `continue` token).
Write operations: `create_objects`, `update_objects`, `delete_objects`. The `apiIdentifier` is **immutable** after creation — set in `meta.apiIdentifier` during `create_objects`. See `/nova-create-type` and `/nova-import-data` for workflows.

Branch operations: `get_branch`, `create_branch`, `update_branch`, `delete_branch`. Dedicated endpoints for branch management — use these instead of generic object CRUD for branches. See `/nova-branches` for workflows.

Additional CMS tools: `get_comments`/`get_comment` for comment management, `get_jobs`/`get_job`/`get_job_logs` for job monitoring (states: 0=New, 1=Running, 2=Succeeded, 3=Error, 4=KillRequest, 5=RestartRequest).

**Index API** — Full-text search via POST with structured filter objects (numeric attrId + compareOperator enums). See `/nova-explore` for full reference.

### When to Use Which API

> **Rule: Use the Index API to search for data. Use the CMS API to read specific objects and to write data.**

| Task | API | Tool |
|------|-----|------|
| Find objects by name, text, or attributes | Index | `novadb_index_search_objects` |
| Count objects matching criteria | Index | `novadb_index_count_objects` |
| Facet/type breakdowns | Index | `novadb_index_object_occurrences` |
| Autocomplete / type-ahead | Index | `novadb_index_suggestions` |
| Search comments | Index | `novadb_index_search_comments` |
| Fetch a known object by ID | CMS | `novadb_cms_get_object` |
| Fetch multiple objects by IDs | CMS | `novadb_cms_get_objects` |
| Browse all objects of a type (no filter) | CMS | `novadb_cms_get_typed_objects` |
| Create, update, or delete objects | CMS | `novadb_cms_create/update/delete_objects` |

**Typical workflow:** Search with Index API, then fetch full details with CMS API:
```
# 1. Find objects matching criteria
novadb_index_search_objects(branch, filter={searchPhrase: "example", objectTypeIds: [2098900]})
# 2. Fetch full details for specific results
novadb_cms_get_object(branch, id=<objectId>, inherited=true)
```

## Common Mistakes

- **Not setting `apiIdentifier` at creation** — Immutable after creation, HTTP 403 if you try to change it
- **Ignoring pagination** — CMS uses `continue` token, Index uses `skip`/`take`. Always check for more results.
- **Forgetting `inherited=true`** — CMS `get_object` only returns local values by default. Use `inherited=true` to see all values including inherited ones.
- **Using apiIdentifier strings instead of numeric IDs** — CMS `values` use numeric attribute IDs, not apiIdentifier strings
- **Form configuration pitfalls** — See `/nova-forms` skill for form-specific rules (formContent encoding, multi-value update semantics, conditional visibility setup).
- **Using numeric values for dataType (1001)** — The `attributeDataType` attribute expects string values like `"String"`, `"ObjRef"`, `"Boolean"` — not numeric enums. Passing a number causes HTTP 400.
- **Using `create_objects` with `typeRef: 40` for branches** — Branches have dedicated endpoints (`create_branch`, `update_branch`, `delete_branch`). Use these instead of generic object CRUD.
- **Using `get_typed_objects` to search** — It lists all objects of a type without filtering. Use `novadb_index_search_objects` for text search and attribute filtering. Reserve `get_typed_objects` for browsing small sets or schema discovery.
- **Partial updates on multi-value attributes** — When updating a multi-valued attribute (e.g., `formContent` / 5053), you must send **all** values in the update, not just the new or changed ones. Any values omitted from the update call will be removed. Always read the current values first, then send the complete set.
