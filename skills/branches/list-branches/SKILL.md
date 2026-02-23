# List Branches

List all branches with pagination and optional ObjRef resolution.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Steps

### 1. Fetch branches

Call `novadb_cms_get_typed_objects`:

```json
{
  "branch": "branchDefault",
  "type": "typeBranch",
  "attributes": "1000,4000,4001,4002,4003,4004",
  "take": 5
}
```

- Use `branch: "branchDefault"` and `type: "typeBranch"` (these are special string identifiers)
- `attributes` filters to only branch-relevant attributes for efficiency
- `take` controls page size (default 5)
- Use the `continue` token from the response to fetch the next page

### 2. Parse branch values

For each branch object, extract values using these attribute IDs:

| Attribute | ID | Language | Type |
|-----------|------|----------|------|
| Name (EN) | 1000 | 201 | String |
| Parent | 4000 | 0 | ObjRef (number) |
| Type | 4001 | 0 | ObjRef (number) |
| Workflow state | 4002 | 0 | ObjRef (number) |
| Due date | 4003 | 0 | DateTime.Date (string) |
| Assigned to | 4004 | 0 | String.UserName |

### 3. Resolve ObjRef names (recommended)

Collect all numeric values from attributes 4000, 4001, and 4002 across all branches. Deduplicate, then fetch in one call:

Call `novadb_cms_get_objects`:

```json
{
  "branch": "branchDefault",
  "ids": "123,456,789",
  "attributes": "1000",
  "inherited": true
}
```

Match each resolved object's `meta.id` to the ObjRef values. The display name is in `attribute: 1000`, `language: 201`.

### 4. Present results

Show a table or list with columns: ID, Name, Parent, Type, State, Due Date, Assigned To.

Include the `continue` token if more pages exist.
