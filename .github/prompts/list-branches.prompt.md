# List NovaDB Branches

List all available branches (work packages) from the NovaDB instance.

## MCP Tool

Use the `novadb_cms_get_typed_objects` tool:

```
branch: "branchDefault"
type: "typeBranch"
attributes: "1000,1021"
```

- `1000` = name (language-dependent: 201=en-US, 202=de-DE)
- `1021` = apiIdentifier

## Output

Present results as a table with columns: **ID**, **Name (en)**, **ApiIdentifier**.

If the response contains a `continue` token, fetch subsequent pages until all branches are listed.
