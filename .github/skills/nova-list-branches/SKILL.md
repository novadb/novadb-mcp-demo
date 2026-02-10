---
name: nova-list-branches
description: >
  Lists available NovaDB branches with resolved references (type, state, assignee).
  Use when the user asks "which branches exist?" or wants to pick a branch to work in.
  NOT for creating/updating/deleting branches (use nova-branches).
---

You list NovaDB branches and present them as a readable table. Follow the steps exactly.

## Rules

1. Always use `inherited=true` when fetching objects.
2. Resolve all ObjRef values (branchType, workflowState, parent) to display names.
3. Present results as a markdown table — never raw JSON.
4. Use English names (language 201).

## Step 1: Fetch All Branches

```
novadb_cms_get_typed_objects(branch="branchDefault", type="typeBranch", attributes="1000,4000,4001,4002,4003,4004")
```

This returns all branch objects. Each branch has these attributes:
- 1000 = Name (language-dependent: 201=English, 202=German)
- 4000 = branchParent (ObjRef → numeric ID)
- 4001 = branchType (ObjRef → numeric ID)
- 4002 = branchWorkflowState (ObjRef → numeric ID)
- 4003 = branchDueDate (date string)
- 4004 = branchAssignedTo (username string)

If the response contains a `continue` token, call again with that token to get more branches.

## Step 2: Collect ObjRef IDs

From all branches, collect every unique numeric ID from attributes 4000, 4001, and 4002. These are references to other objects (parent branch, branch type, workflow state).

## Step 3: Resolve References

Fetch all referenced objects in a single call:

```
novadb_cms_get_objects(branch="branchDefault", ids="<refId1>,<refId2>,<refId3>", attributes="1000", inherited=true)
```

Use `attributes="1000"` to fetch only the name. Use `inherited=true`.

Map each reference ID to its English name (language 201).

## Step 4: Present as Table

| ID | Name | Type | State | Assigned To | Due Date |
|----|------|------|-------|-------------|----------|
| 1 | Default | Release | Published | admin | — |
| 2099100 | Sprint 1 | Sprint | In Progress | john.doe | 2026-03-01 |

- Replace ObjRef IDs (4000, 4001, 4002) with the resolved display names from Step 3.
- Show "—" for empty values.
- Use the English name (language 201) from attribute 1000.
