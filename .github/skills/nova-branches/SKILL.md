---
name: nova-branches
description: >
  Manage NovaDB branches (work packages) — create, update, delete, and inspect branches.
  Use when the user wants to manage branch lifecycle, change workflow states, or assign branches.
  NOT for listing branches (use nova-list-branches).
---

You have access to the NovaDB MCP server tools. This skill covers branch (work package) management via the dedicated CMS Branch API.

## Important: Use Dedicated Branch Endpoints

Branches have their own API endpoints — do **not** use `create_objects`/`update_objects`/`delete_objects` with `typeRef: 40` for branch operations. Use the dedicated tools instead:

| Operation | Tool | Notes |
|-----------|------|-------|
| Read | `novadb_cms_get_branch(id)` | Returns CmsObject with all branch values |
| Create | `novadb_cms_create_branch(values)` | Flat `{ comment, values }` body (no `objects` wrapper) |
| Update | `novadb_cms_update_branch(id, values)` | Flat `{ comment, values }` body |
| Delete | `novadb_cms_delete_branch(id)` | Permanent deletion — cannot be undone |
| List | `novadb_cms_get_typed_objects(branch="branchDefault", type="typeBranch")` | Browse all branches |

## Branch Attributes

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 1000 | `attributeName` | String | Branch name (language-dependent: 201=en-US, 202=de-DE) |
| 4000 | `branchParent` | ObjRef | Parent work package |
| 4001 | `branchType` | ObjRef | Work package type (resolve to see name) |
| 4002 | `branchWorkflowState` | ObjRef | Current workflow state |
| 4003 | `branchDueDate` | DateTime.Date | Due date (e.g. `"2026-03-01"`) |
| 4004 | `branchAssignedTo` | String.UserName | Assigned user |

## Workflows

### List and Inspect Branches

```
# 1. List all branches
novadb_cms_get_typed_objects(branch="branchDefault", type="typeBranch")

# 2. Get full details for a specific branch
novadb_cms_get_branch(id=<branchId>)

# 3. Resolve ObjRef values (parent, type, workflow state)
novadb_cms_get_objects(branch="branchDefault", ids="<parentId>,<typeId>,<stateId>")
```

### Create a Branch

```
novadb_cms_create_branch(
  values=[
    { "attribute": 1000, "language": 201, "value": "My New Branch" },
    { "attribute": 1000, "language": 202, "value": "Mein neuer Branch" },
    { "attribute": 4000, "value": <parentBranchId> },
    { "attribute": 4001, "value": <branchTypeId> },
    { "attribute": 4003, "value": "2026-06-01" },
    { "attribute": 4004, "value": "john.doe" }
  ],
  comment="Created new branch"
)
```

To find valid branch types and workflow states:
```
# Discover branch types
novadb_cms_get_typed_objects(branch="branchDefault", type="typeBranchType")

# Discover workflow states
novadb_cms_get_typed_objects(branch="branchDefault", type="typeWorkflowState")
```

### Update a Branch

```
# Change workflow state
novadb_cms_update_branch(
  id=<branchId>,
  values=[{ "attribute": 4002, "value": <newStateId> }],
  comment="Moved to review state"
)

# Reassign branch
novadb_cms_update_branch(
  id=<branchId>,
  values=[{ "attribute": 4004, "value": "jane.doe" }],
  comment="Reassigned to jane.doe"
)

# Update due date
novadb_cms_update_branch(
  id=<branchId>,
  values=[{ "attribute": 4003, "value": "2026-09-01" }],
  comment="Extended deadline"
)
```

### Delete a Branch

**Warning:** Branch deletion is permanent and cannot be undone. Always confirm with the user before deleting.

```
novadb_cms_delete_branch(
  id=<branchId>,
  comment="Deleted obsolete branch"
)
```

### Navigate Branch Hierarchy

Branches can have parent-child relationships via `branchParent` (4000).

```
# 1. Get branch and check its parent
novadb_cms_get_branch(id=<branchId>)
# Look for attribute 4000 (branchParent) in the response

# 2. Find child branches by searching for references
novadb_index_search_objects(
  branch="branchDefault",
  filter={ "objectTypeIds": [40], "filters": [{ "attrId": 4000, "value": "<parentId>", "compareOperator": 7 }] }
)
```

## Differences from Object CRUD

| Aspect | Objects | Branches |
|--------|---------|----------|
| Endpoint | `/branches/{branch}/objects` | `/branches` and `/branches/{id}` |
| Request body | `{ comment, objects: [{ meta, values }] }` | `{ comment, values }` (flat, no meta/objects wrapper) |
| Batch support | Yes (array of objects) | No (one branch per request) |
| Delete behavior | Marks as deleted (soft delete) | Permanent deletion |
| Listing | `get_typed_objects(branch, type=...)` | `get_typed_objects(branch="branchDefault", type="typeBranch")` |
