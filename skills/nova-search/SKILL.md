---
name: nova-search
description: Search for NovaDB objects by text, attributes, or type using the Index API.
---

You search for NovaDB objects using the Index API, then resolve details via the CMS API.

## Workflow

Follow these steps in order:

### Step 1: Identify the Object Type ID

If the user mentions a type name, find its numeric ID first:

```
novadb_index_search_objects(branch, filter={searchPhrase: "<type name>", objectTypeIds: [0]}, take=5)
```

This searches object types (typeId 0 = the meta-type for object types). Note the `id` from the result — you need it as `objectTypeIds` filter in Step 2.

If the user already provided a type ID, skip this step.

### Step 2: Count Results

Before fetching, check how many objects match:

```
novadb_index_count_objects(branch, filter={objectTypeIds: [<typeId>], searchPhrase: "<optional search text>"})
```

If > 50 results, tell the user and ask if they want to narrow down.

### Step 3: Search Objects

```
novadb_index_search_objects(branch, filter={
  searchPhrase: "<search text>",
  objectTypeIds: [<typeId>],
  filters: [
    { attrId: <numericAttrId>, value: "<value>", compareOperator: 0, langId: 201 }
  ]
}, take=20)
```

The response contains objects with `id`, `displayName`, `typeRef`, and `modifiedBy`.

### Step 4: Fetch Full Details

For each object you want to show details for:

```
novadb_cms_get_object(branch, id=<objectId>, inherited=true)
```

Or fetch multiple at once:

```
novadb_cms_get_objects(branch, ids="<id1>,<id2>,<id3>", inherited=true)
```

### Step 5: Resolve References

Look for ObjRef values in the response — these are numeric IDs pointing to other objects. Collect all unique reference IDs and resolve them in a single call:

```
novadb_cms_get_objects(branch, ids="<refId1>,<refId2>", attributes="1000")
```

Use `attributes="1000"` to fetch only the name attribute — this is efficient for display name resolution.

### Step 6: Present as Table

Format results as a markdown table. Example:

| ID | Name | Category | Status |
|----|------|----------|--------|
| 2099001 | Example Product | Electronics | Active |

## Filter Reference

**Compare operators for `filters[].compareOperator`:**
- 0 = Equal
- 1 = NotEqual
- 2 = LessThan
- 3 = LessThanOrEqual
- 4 = GreaterThan
- 5 = GreaterThanOrEqual
- 6 = Wildcard (use `*` in value)
- 7 = Ref (reference filter)

**Sort options for `sortBy[].sortBy`:**
- 0 = Score (relevance)
- 3 = DisplayName
- 4 = Modified
- 6 = Attribute (requires `attrId`)

## Data Format

CMS values are tuples: `{ attribute: <numericId>, language: <langId>, variant: 0, value: <val> }`

- `language: 0` = language-independent
- `language: 201` = English (en-US)
- `language: 202` = German (de-DE)

**Key attributes:**
- 1000 = Name (language-dependent)
- 1012 = Description (language-dependent)
- 1021 = API Identifier

ObjRef values are numeric IDs (e.g. `"value": 2099050`) — always resolve them to display names.
