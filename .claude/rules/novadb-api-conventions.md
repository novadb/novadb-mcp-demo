---
globs: src/**/*.ts
---

# NovaDB API Conventions

## CMS API Response Formats

Responses differ by HTTP method — do NOT assume a uniform shape.

| Method | Endpoint | Response |
|--------|----------|----------|
| **POST** | `/branches/{id}/objects` | `{ transaction, createdObjectIds: number[] }` |
| **PATCH** | `/branches/{id}/objects` | `{ updatedObjects, createdValues, transaction }` |
| **DELETE** | `/branches/{id}/objects` | `{ deletedObjects, transaction }` |
| **GET** | `/branches/{id}/objects` | `{ objects: CmsObject[] }` or single `CmsObject` |
| **PATCH** | `/comments/{id}` | Empty body (204 No Content) |

After creating objects, fetch them with `getObject()` to return full data to the user.

## Multi-Value ObjRef

Multi-value ObjRef attributes (e.g. form content, allowed types) are stored as **separate CmsValue entries** with `sortReverse` for ordering. Never use arrays.

```typescript
// WRONG
{ attribute: ATTR_FORM_CONTENT, language: 0, variant: 0, value: [id1, id2] }

// CORRECT
{ attribute: ATTR_FORM_CONTENT, language: 0, variant: 0, value: id1, sortReverse: 0 },
{ attribute: ATTR_FORM_CONTENT, language: 0, variant: 0, value: id2, sortReverse: 1 },
```

Use `buildFormContentValues()` and `extractMultiValueObjRef()` from `tests/fixtures/helpers.ts`.

## Comment Body

Comment body must be valid XHTML with a `<div>` root element:

```typescript
body: "<div>This is a comment</div>"
```

## Branches

Branches use dedicated CMS client methods (`createBranch`, `updateBranch`, `deleteBranch`), not generic object creation. Branch attributes use the 4000-range constants from `constants.ts`.

## Code Generator

Only `"csharp"` is supported as a code generator language. TypeScript is not available.

## Attribute Definitions → Form Link Chain

There is NO direct attribute on object types that links to attribute definitions. The relationship flows through forms:

```
Object Type
  → Create Form (ATTR_OBJ_TYPE_CREATE_FORM = 5001)
  → Detail Forms (ATTR_OBJ_TYPE_DETAIL_FORMS = 5002)
    → Form Fields (ATTR_FORM_CONTENT = 5053)
      → Attribute Definitions (the field IDs)
```

## Language-Dependent Values

Language-dependent attributes need separate CmsValue entries per language:

```typescript
{ attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: "English Name" },
{ attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: "Deutscher Name" },
```

Language IDs: `LANG_EN = 201`, `LANG_DE = 202`.
