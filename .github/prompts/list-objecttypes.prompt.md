# List NovaDB Object Types

List all object types defined in a branch.

## Prerequisites

Ask the user which branch to use if not already known. Discover branches via the `list-branches` prompt.

## MCP Tool

Use the `novadb_cms_get_typed_objects` tool:

```
branch: "<branchId>"
type: "root"
attributes: "1000,1021"
```

- `type: "root"` (ID 0) is the meta-type for object types
- `1000` = name (language-dependent: 201=en-US, 202=de-DE)
- `1021` = apiIdentifier

## Output

Present results as a table with columns: **ID**, **Name (en)**, **ApiIdentifier**.

To show only types **new in this branch**, filter for `type.id > branchId`. System types and types from other branches have smaller IDs.

Paginate using the `continue` token until all types are listed.
