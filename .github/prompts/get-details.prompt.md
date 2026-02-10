# Get NovaDB Object Details

Fetch and display full details for one or more NovaDB objects.

## Prerequisites

Ask the user for:
1. **Branch** — if not already known
2. **Object ID(s)** — numeric IDs, or search term to find objects first

If the user provides a search term instead of an ID, use `novadb_index_search_objects` to find matching objects first:

```
branch: "<branchId>"
filter: { "searchPhrase": "<term>" }
```

## MCP Tool

Use `novadb_cms_get_object` for a single object or `novadb_cms_get_objects` for multiple:

```
branch: "<branchId>"
id: "<objectId>"
inherited: true
```

Always set `inherited: true` to include inherited values.

## Resolving References

Values with numeric IDs or arrays of IDs are references (ObjRef). Resolve them with `novadb_cms_get_objects`:

```
branch: "<branchId>"
ids: "<refId1>,<refId2>"
attributes: "1000"
```

## Resolving Attribute Names

Attribute IDs in the values array are numeric. To show human-readable names, fetch attribute definitions:

```
novadb_cms_get_objects(branch: "<branchId>", ids: "<attrId1>,<attrId2>", attributes: "1000,1021")
```

- `1000` = attribute name
- `1021` = apiIdentifier

## Output

Present the object as a readable list of **attribute name: value** pairs, with references resolved to their display names where possible.
