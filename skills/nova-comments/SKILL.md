---
name: nova-comments
description: Manage NovaDB comments — create, read, update, delete, and search comments on objects.
---

## Body Format: XHTML with `<div>` Root

Comment bodies must be valid XHTML wrapped in `<div>`. Plain text and other root elements (`<p>`, `<span>`) cause HTTP 400.

```
"<div>Missing Email</div>"
"<div><p>Paragraph one</p><p>Paragraph two</p></div>"
```

## Tools

| Operation | Tool                                                     |
| --------- | -------------------------------------------------------- |
| Create    | `novadb_cms_create_comment(branchId, objectRef, body)`   |
| Read      | `novadb_cms_get_comment(commentId)`                      |
| List      | `novadb_cms_get_comments(branchRef?, objectRef?, user?)` |
| Update    | `novadb_cms_update_comment(commentId, body)`             |
| Delete    | `novadb_cms_delete_comment(commentId)`                   |
| Search    | `novadb_index_search_comments(branch, filter)`           |
| Count     | `novadb_index_count_comments(branch, filter)`            |
| Facets    | `novadb_index_comment_occurrences(branch, ...)`          |

## Create

```
novadb_cms_create_comment(
  branchId=<branchId>,       # numeric
  objectRef=<objectId>,      # numeric
  body="<div>Text</div>",
  username="john.doe"        # optional, defaults to $cms
)
```

## Search (Index API)

```
novadb_index_search_comments(
  branch="<branchId>",
  filter={ "searchPhrase": "...", "user": "...", "mentioned": "...", "objectTypes": [...] }
)
```

`sortField`: 0=Id, 1=User, 2=Created, 3=Modified, 4=ObjectId, 5=ObjectType. Pagination via `skip`/`take`.

## Gotchas

- **`<div>` root is mandatory** — other root elements or plain text cause HTTP 400
- **`branchId` and `objectRef` are numeric** — not apiIdentifier or GUID
- **`commentId` is a string**
- **CMS pagination** uses `take` + `continue` token; **Index pagination** uses `skip` + `take`
