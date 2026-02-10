---
name: nova-explore
description: Explores NovaDB data — browse branches, types, objects, properties, search, and filter. Use when the user wants to query, inspect, understand, or analyze Nova data structures.
---
You have access to the NovaDB MCP server tools. This skill covers all read operations via the CMS and Index APIs.

> **Focused alternatives:** Use `/nova-search` for finding data objects by text/attributes/type. Use `/nova-list-branches` for listing branches. This skill is best for schema discovery and deep data exploration.

> **Prefer the Index API for searching and filtering.** Use CMS API for fetching specific objects by ID, resolving references, and browsing schema/type definitions. Typical pattern: search with Index API, then resolve details with CMS API.

## Discovery Workflow

**Schema discovery (CMS API):**
1. **Branches:** `novadb_cms_get_typed_objects(branch="branchDefault", type="typeBranch")` — List available branches
2. **Types:** `novadb_cms_get_typed_objects(branch, type="root")` — List object types in a branch
3. **Languages:** `novadb_cms_get_typed_objects(branch, type="typeLanguage")` — Check available languages
4. **Branch details:** `novadb_cms_get_branch(id=<branchId>)` — Get full branch object with all properties

**Searching for data (Index API — preferred):**
5. **Count objects:** `novadb_index_count_objects(branch, filter={objectTypeIds: [<typeId>]})` — Check result set size before fetching
6. **Search objects:** `novadb_index_search_objects(branch, filter={searchPhrase: "...", objectTypeIds: [...]})` — Find objects by text, attributes, or type
7. **Suggestions:** `novadb_index_suggestions(branch, pattern="...")` — Type-ahead / autocomplete

**Fetching details (CMS API):**
8. **Single object:** `novadb_cms_get_object(branch, id=<objectId>, inherited=true)` — Deep-dive into one object with all values
9. **Resolve references:** `novadb_cms_get_objects(branch, ids="<refId1>,<refId2>,...")` — Fetch referenced objects separately
10. **Browse all of a type:** `novadb_cms_get_typed_objects(branch, type="<apiIdentifier>")` — List objects without filtering (prefer Index API when filtering is needed)

## CMS API Data Format

The CMS API returns **normalized value tuples**, not flat key-value props:

```json
{
  "meta": {
    "id": 2099001, "guid": "...", "apiIdentifier": "optionalId",
    "typeRef": 2098900, "lastTransaction": 42, "deleted": false
  },
  "values": [
    { "attribute": 1000, "language": 201, "variant": 0, "value": "English Name" },
    { "attribute": 1000, "language": 202, "variant": 0, "value": "Deutscher Name" },
    { "attribute": 2098950, "language": 0, "variant": 0, "value": 2099050 }
  ]
}
```

- `attribute` — Numeric attribute definition ID (use Universal/System Attribute tables to decode)
- `language` — Language ID (0=language-independent, 201=en-US, 202=de-DE)
- `variant` — Variant ID (0 for no variant)
- Use `inherited=true` to include inherited values (important for getting the full picture)

## Resolving References

References (ObjRef) appear as numeric IDs in `value`. To resolve them:

```
# 1. Fetch the main object
novadb_cms_get_object(branch, id=<objectId>, inherited=true)

# 2. Identify ObjRef values (single numeric ID or array of IDs)
# e.g. { "attribute": 5001, "value": 2098950 }  or  { "attribute": 5002, "value": [2098950, 2098951] }

# 3. Fetch referenced objects in a single call
novadb_cms_get_objects(branch, ids="2098950,2098951")
```

## Branch Inspection

Use `novadb_cms_get_branch(id=<branchId>)` to fetch a branch as a full CmsObject with all its properties.

**Branch-specific attributes (typeBranch):**

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 4000 | `branchParent` | ObjRef | Parent work package |
| 4001 | `branchType` | ObjRef | Work package type (resolve to see name) |
| 4002 | `branchWorkflowState` | ObjRef | Current workflow state (resolve to see name) |
| 4003 | `branchDueDate` | DateTime.Date | Due date |
| 4004 | `branchAssignedTo` | String.UserName | Assigned user |

Resolve ObjRef values (4000, 4001, 4002) with `novadb_cms_get_objects(branch, ids="...")` to get display names.

## Pagination (CMS API)

The CMS API uses **cursor-based pagination** with a `continue` token:

- `take` — Number of items per page (default 20)
- Response includes a `continue` token when more results exist
- Pass the `continue` token to the next call to get the next page

```
# First page
novadb_cms_get_typed_objects(branch, type="otPeople", take=50)
# Next page (use continue token from response)
novadb_cms_get_typed_objects(branch, type="otPeople", take=50, continue="<token>")
```

## Search & Filtering (Index API — Preferred)

The Index API provides Lucene-powered search with structured filters.

### Object Search

- `novadb_index_search_objects(branch, filter?, sortBy?, skip?, take?)` — Full-text + filtered search
- `novadb_index_count_objects(branch, filter?)` — Count matching objects
- `novadb_index_object_occurrences(branch, filter?)` — Facet counts by type, modifiedBy, deleted

### Comment Search

- `novadb_index_search_comments(branch, filter?, sortField?, sortReverse?, skip?, take?)` — Search by text, author, mentioned user, or object type
- `novadb_index_count_comments(branch, filter?)` — Count matching comments

### Other Index Tools

- `novadb_index_suggestions(branch, pattern?)` — Type-ahead with `suggestDisplayName` and attribute-specific `suggestAttributes`. Supports fuzzy matching.
- `novadb_index_work_item_occurrences()` — Work items per branch (global endpoint)

### Index API Filter Model

```json
{
  "filter": {
    "searchPhrase": "search text",
    "objectTypeIds": [2098874],
    "modifiedBy": "username",
    "deleted": false,
    "filters": [
      { "attrId": 1000, "langId": 201, "variantId": 0, "value": "test", "compareOperator": 0 }
    ]
  }
}
```

**Compare operators:** 0=Equal, 1=NotEqual, 2=LessThan, 3=LessThanOrEqual, 4=GreaterThan, 5=GreaterThanOrEqual, 6=Wildcard, 7=Ref

**Sort options:** 0=Score, 1=ObjId, 2=TypeRef, 3=DisplayName, 4=Modified, 5=ModifiedBy, 6=Attribute

### Index API Pagination

Uses `skip`/`take` (offset-based):
- `take` — Number of results (default varies)
- `skip` — Offset for paging

## Property Data Types

| Data Type | Example Value | Notes |
|-----------|--------------|-------|
| `String` | `"Hello World"` | Plain text, may be language-dependent |
| `TextRef` | `"Long description..."` | Long/rich text |
| `TextRef.JavaScript` | `"function() { ... }"` | JavaScript code |
| `TextRef.CSS` | `"body { color: #000; }"` | CSS stylesheet code |
| `XmlRef.SimpleHtml` | `{"XML": "<div>...</div>"}` | Rich text (XHTML) |
| `XmlRef.VisualDocument` | `{"id": "...", "type": "group", ...}` | Visual component trees (CMS pages) |
| `Integer` | `42` | Whole numbers |
| `Decimal` | `3.14` | Decimal numbers |
| `Boolean` | `true` / `false` | Checkbox values |
| `DateTime.Date` | `"2026-01-08"` | Date only |
| `ObjRef` | `2099001` or `[2099001, 2099002]` | Reference(s) to other objects |
| `BinRef.Icon` | (binary) | Icon image upload |
| `BinRef.Thumbnail` | (binary) | Thumbnail image |
| `String.DataType` | `"ObjRef"` | Enumerated data type selector |
| `String.InheritanceBehavior` | `"None"`, `"Inheriting"`, `"InheritingAll"` | Inheritance mode |
| `String.UserName` | `"john.doe"` | User name picker |

Properties can be:
- **Language-dependent** — Multiple value tuples with different `language` IDs
- **Multi-valued** — Returned as arrays in the `value` field
- **Virtual** — Computed by JavaScript, not stored directly
- **Inherited** — Only visible with `inherited=true`

## System Object Types

**Core Schema (IDs 0-210):**

| ID | apiIdentifier | Name |
|----|--------------|------|
| 0 | `root` | Object Type (meta-type) |
| 10 | `typeAttribute` | Attribute Definition |
| 11 | `typeAttributeGroup` | Attribute Group |
| 12 | `typeAttributeMainGroup` | Attribute Main Group |
| 20 | `typeLanguage` | Language |
| 30 | `typeUnit` | Unit of Measure |
| 31 | `typeUnitGroup` | Unit Group |
| 40 | `typeBranch` | Work Package (branch) |
| 50 | `typeForm` | Form Definition |
| 60 | `typeApplicationArea` | Application Area |
| 70 | `typeUiString` | UI String |
| 80 | `typeWorkflowState` | Workflow State |
| 90 | `typeKanbanBoard` | Kanban Board |
| 100 | `typeMediaType` | Media Type |
| 120 | `typeJobDefinition` | Job Definition |
| 130 | `typePackage` | Package |
| 140 | `typeTreeDefinition` | Tree Definition |
| 150 | `typeRazorView` | Razor View |
| 155 | `typeParameter` | Parameter |
| 160 | `typeTriggerDefinition` | Trigger Definition |
| 161 | `typeTimerDefinition` | Timer Definition |
| 180 | `typeBranchType` | Work Package Type |
| 190 | `typePresentationAs` | Presentation Type |
| 200 | `typeExternalApi` | External API |
| 210 | `typeWebHookDefinition` | Web Hook Definition |

**Conditions (IDs 170-176):**

| ID | apiIdentifier | Name |
|----|--------------|------|
| 170 | `typeScriptedCondition` | Scripted Condition |
| 171 | `typeObjectReferenceValueCondition` | Object Reference Condition |
| 172 | `typeUserNameValueCondition` | User Name Condition |
| 173 | `typeStringValueCondition` | String Condition |
| 174 | `typeNumericValueCondition` | Numeric Condition |
| 175 | `typeTimestampValueCondition` | Timestamp Condition |
| 176 | `typeBooleanValueCondition` | Boolean Condition |

**Typography & Visual Components (IDs 300-402):**

| ID | apiIdentifier | Name |
|----|--------------|------|
| 300 | `typeParagraphStyle` | Paragraph Style |
| 301 | `typeCascadingStyleSheet` | Cascading Style Sheet |
| 302 | `typeTextAlignment` | Text Alignment |
| 303 | `typeFontFamily` | Font Family |
| 304 | `typeFontFace` | Font Face |
| 400 | `typeVisualComponentDefinition` | Visual Component |
| 401 | `typeVisualComponentDefinitionGroup` | Visual Component Group |
| 402 | `typeVisualComponentType` | Visual Component Type |

**Package-Installed Types (IDs 2098514-2098844):**

| ID | apiIdentifier | Name |
|----|--------------|------|
| 2098514 | `typeCountry` | Country |
| 2098769 | `typeImage` | Image |
| 2098770 | `typePdfDocument` | PDF Document |
| 2098833 | `typeSpreadsheet` | Spreadsheet |
| 2098834 | `typeDocument` | Document |
| 2098835 | `typeAudioDerivative` | Audio Derivative |
| 2098836 | `typeImageDerivative` | Image Derivative |
| 2098837 | `typeVideoDerivative` | Video Derivative |
| 2098838 | `typePresentation` | Presentation |
| 2098839 | `typeVideo` | Video |
| 2098840 | `typeArchive` | Archive |
| 2098841 | `typeAudio` | Audio |
| 2098842 | `typeMediaRoot` | Mediatree Root |
| 2098843 | `typeMediaFolder` | Media Tree Folder |
| 2098844 | `typeVideoSubtitles` | Video Subtitles |

## System Type Attribute Reference

**typeLanguage properties:**

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 2001 | `attributeIsoLanguageCode` | String | ISO code, e.g. `de-DE`, `en-US` |
| 2002 | `attributeFallbackLanguage` | ObjRef | Fallback language reference |

**typeUnit / typeUnitGroup properties:**

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 3001 | `unitGroupBaseUnit` | ObjRef | Base unit of a unit group |
| 3002 | `unitParentGroup` | ObjRef | Parent unit group |
| 3003 | `unitSymbol` | String | Localized symbol (e.g. `cm`, `kg`) |
| 3005 | `unitBaseFactor` | Decimal | Conversion factor to base unit |

**typeApplicationArea properties:**

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 6001 | `applicationAreaObjectTypes` | ObjRef (multi) | Object types shown in this area |
| 6003 | `applicationAreaSortKey` | Integer | Sort order for the area |

**typeBranch (Work Package) properties:**

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 4000 | `branchParent` | ObjRef | Parent work package |
| 4001 | `branchType` | ObjRef | Work package type |
| 4002 | `branchWorkflowState` | ObjRef | Current workflow state |
| 4003 | `branchDueDate` | DateTime.Date | Due date |
| 4004 | `branchAssignedTo` | String.UserName | Assigned user |

## Visual Content (CMS Pages)

Page objects may contain a `websitePageContent` property with a nested visual component tree:

```json
{
  "id": "...",
  "type": "group",
  "definition": "visualComponentRoot",
  "element": "div",
  "class": "main",
  "children": [
    { "type": "text", "element": "h1", "content": "Headline" },
    { "type": "image", "element": "img", "objectId": 2099102 }
  ]
}
```

Component types: `group` (container with children), `text` (text content), `image` (media reference via `objectId`).

## Presentation Guidelines

- Present results in readable tables or summaries, not raw JSON
- When showing objects with references, resolve and show the referenced display names
- For large result sets, summarize counts and show representative samples
- CMS returns all languages at once — present the user's preferred language

## Gotchas

- **CMS returns numeric attribute IDs** — Use the attribute reference tables above to decode attribute meanings
- **References are numeric IDs** — Resolve with a separate `novadb_cms_get_objects(branch, ids="...")` call
- **Use `inherited=true`** when reading objects to include inherited values
- **CMS pagination uses `continue` tokens** — Not `skip`/`take`. Check response for continuation token.
- **Index API pagination uses `skip`/`take`** — Different from CMS pagination
- **Use IDs or apiIdentifiers for branches**, not display names
- **Index API uses structured filters** with numeric attribute IDs and compare operators (not string-based filtering syntax)
- **Don't use `get_typed_objects` to search** — It fetches all objects without filtering. Use `novadb_index_search_objects` to find objects, then `novadb_cms_get_object` for details.
