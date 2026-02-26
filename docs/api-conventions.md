# NovaDB API Conventions

## CMS API Response Formats

Responses differ by HTTP method — do not assume a uniform shape.

| Method | Endpoint | Response |
|--------|----------|----------|
| **POST** | `/branches/{id}/objects` | `{ transaction, createdObjectIds: number[] }` |
| **PATCH** | `/branches/{id}/objects` | `{ updatedObjects, createdValues, transaction }` |
| **DELETE** | `/branches/{id}/objects` | `{ deletedObjects, transaction }` |
| **GET** | `/branches/{id}/objects` | `{ objects: CmsObject[] }` or single `CmsObject` |
| **PATCH** | `/comments/{id}` | Empty body (204 No Content) |

After creating objects, fetch them with `getObject()` to return full data.

## Multi-Value ObjRef

Multi-value ObjRef attributes (e.g. form content, allowed types) are stored as **separate CmsValue entries** with `sortReverse` for ordering. Never use arrays.

```typescript
// WRONG — arrays are not supported
{ attribute: ATTR_FORM_CONTENT, language: 0, variant: 0, value: [id1, id2] }

// CORRECT — one entry per value, ordered by sortReverse
{ attribute: ATTR_FORM_CONTENT, language: 0, variant: 0, value: id1, sortReverse: 0 },
{ attribute: ATTR_FORM_CONTENT, language: 0, variant: 0, value: id2, sortReverse: 1 },
```

Helper functions are available in `tests/fixtures/helpers.ts`:
- `buildFormContentValues()` — builds multi-value entries from an array of IDs
- `extractMultiValueObjRef()` — extracts ordered IDs from CmsValue entries

## Language-Dependent Values

Language-dependent attributes require separate CmsValue entries per language:

```typescript
{ attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: "English Name" },
{ attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: "Deutscher Name" },
```

Language IDs: `LANG_EN = 201` (en-US), `LANG_DE = 202` (de-DE).

## Comment Body

Comment body must be valid XHTML with a `<div>` root element:

```typescript
body: "<div>This is a comment</div>"
```

## Branches

Branches use dedicated CMS client methods (`createBranch`, `updateBranch`, `deleteBranch`), not generic object CRUD. Branch attributes use the 4000-range constants (see [constants-reference.md](constants-reference.md)).

## Code Generator

Only `"csharp"` is supported as a code generator language.

## Type → Form → Attribute Chain

There is no direct link from object types to attribute definitions. The relationship flows through forms:

```
Object Type (typeRef=0)
  → Create Form  (ATTR_OBJ_TYPE_CREATE_FORM = 5001)
  → Detail Forms (ATTR_OBJ_TYPE_DETAIL_FORMS = 5002)
    → Form Fields (ATTR_FORM_CONTENT = 5053)
      → Attribute Definitions (typeRef=10)
```

To discover which attributes belong to a type, follow this chain: fetch the type, collect form IDs from attributes 5001/5002, fetch those forms, collect attribute definition IDs from attribute 5053, then fetch the attribute definitions.

## Debugging API Issues

When encountering unclear API errors, test directly with `curl` and Basic Auth to inspect the raw response:

```bash
# CMS API — GET
curl -u "$NOVA_CMS_USER:$NOVA_CMS_PASSWORD" \
  "https://$NOVA_HOST/cms/branches/2100347/objects/12345"

# CMS API — POST with body
curl -u "$NOVA_CMS_USER:$NOVA_CMS_PASSWORD" \
  -X POST -H "Content-Type: application/json" \
  -d '{"values":[...]}' \
  "https://$NOVA_HOST/cms/branches/2100347/objects"

# Index API
curl -u "$NOVA_INDEX_USER:$NOVA_INDEX_PASSWORD" \
  "https://$NOVA_HOST/index/objects?query=MCP-*&limit=10"
```

This quickly reveals whether an error originates in the API client code or in the API itself.
