# Update Branch

Update properties of an existing branch.

## Tool

`novadb_cms_update_branch`

## Parameters

- `id` — Branch ID (string)
- `values` — Array of `CmsValue` objects for the fields to change
- `comment` — (optional) Audit trail comment
- `username` — (optional) Acting username for audit

## Branch Attribute IDs

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Name (EN) | 1000 | String | `language: 201`, `variant: 0` |
| Name (DE) | 1000 | String | `language: 202`, `variant: 0` |
| Parent branch | 4000 | ObjRef | `language: 0`, `variant: 0` |
| Branch type | 4001 | ObjRef | `language: 0`, `variant: 0` |
| Workflow state | 4002 | ObjRef | `language: 0`, `variant: 0` |
| Due date | 4003 | DateTime.Date | `language: 0`, `variant: 0`, ISO format |
| Assigned to | 4004 | String.UserName | `language: 0`, `variant: 0` |

## Value Construction

Only include the fields you want to change. Omitted fields remain unchanged.

```json
{
  "id": "2100500",
  "values": [
    { "attribute": 1000, "language": 201, "variant": 0, "value": "Updated Name" },
    { "attribute": 4004, "language": 0, "variant": 0, "value": "newuser" }
  ],
  "comment": "Updated branch name and assignee"
}
```

## Response

Returns the update result (updatedObjects count, transaction).
