---
name: nova-forms
description: "Form architecture reference — attributes, multi-value patterns, form-type linkage, and configuration workflows."
user-invocable: false
allowed-tools: novadb_cms_get_object, novadb_cms_get_objects, novadb_cms_get_typed_objects, novadb_cms_create_objects, novadb_cms_update_objects, novadb_cms_delete_objects, novadb_index_search_objects, novadb_index_count_objects
---

# NovaDB Form Configuration Reference

Complete reference for form architecture, attribute IDs, value format, workflows, and condition system.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All numeric IDs in examples are samples — always use real IDs from the target system.

## Form Basics

Forms (typeRef=50) define which attribute fields are shown when editing objects in the UI. They control layout, field ordering, and conditional visibility.

---

## Form Attribute IDs

| Attribute | ID | Type | Notes |
|-----------|------|------|-------|
| Name (EN) | 1000 | String | `language: 201`, `variant: 0` |
| Name (DE) | 1000 | String | `language: 202`, `variant: 0` |
| Description | 1012 | String | Language-dependent |
| API Identifier | 1021 | String | Language-independent |
| Form content (fields) | 5053 | ObjRef | **Multi-value** — one entry per field with `sortReverse` |
| Condition attribute | 5054 | ObjRef | Single — form visible only when this attribute matches |
| Condition refs | 5055 | ObjRef | Multi-value — which values trigger visibility |
| Is single editor | 5056 | Boolean | Render as single code editor instead of individual fields |

---

## Multi-Value ObjRef Pattern (attribute 5053)

**CRITICAL**: Form content uses separate CmsValue entries with `sortReverse` for ordering. Never use arrays.

### Correct

```json
{ "attribute": 5053, "language": 0, "variant": 0, "value": 2100500, "sortReverse": 0 },
{ "attribute": 5053, "language": 0, "variant": 0, "value": 2100501, "sortReverse": 1 },
{ "attribute": 5053, "language": 0, "variant": 0, "value": 2100502, "sortReverse": 2 }
```

### Wrong

```json
{ "attribute": 5053, "language": 0, "variant": 0, "value": [2100500, 2100501, 2100502] }
```

The same pattern applies to all multi-value ObjRef attributes: 5002 (detail forms), 5055 (condition refs), 6001 (app area types).

---

## Form ↔ Object Type Linkage

Forms are attached to object types via two attributes on the type (typeRef=0):

| Role | Attribute | ID | Cardinality |
|------|-----------|------|-------------|
| Create form | `ATTR_OBJ_TYPE_CREATE_FORM` | 5001 | Single ObjRef |
| Detail forms (tabs) | `ATTR_OBJ_TYPE_DETAIL_FORMS` | 5002 | Multi-value ObjRef with `sortReverse` |

### Set create form

```json
{
  "branch": "<branch>",
  "objects": [{
    "meta": { "id": "<typeId>", "typeRef": 0 },
    "values": [
      { "attribute": 5001, "language": 0, "variant": 0, "value": "<formId>" }
    ]
  }]
}
```

Tool: `novadb_cms_update_objects`

### Add detail form

Read existing 5002 values first, then send the complete set:

```json
{
  "branch": "<branch>",
  "objects": [{
    "meta": { "id": "<typeId>", "typeRef": 0 },
    "values": [
      { "attribute": 5002, "language": 0, "variant": 0, "value": "<existingFormId>", "sortReverse": 0 },
      { "attribute": 5002, "language": 0, "variant": 0, "value": "<newFormId>", "sortReverse": 1 }
    ]
  }]
}
```

---

## Workflows

### Inspect a form

1. Fetch the form:
   ```json
   {
     "branch": "<branch>",
     "objectId": "<formId>",
     "inherited": true
   }
   ```
   Tool: `novadb_cms_get_object`

2. Extract field IDs from values where `attribute === 5053`. Sort by `sortReverse` ascending.

3. Resolve attribute definitions:
   ```json
   {
     "branch": "<branch>",
     "ids": "<attrDefId1>,<attrDefId2>,<attrDefId3>",
     "attributes": "1000,1001,1017,1018",
     "inherited": true
   }
   ```
   Tool: `novadb_cms_get_objects`

4. Present as table: Field Order, Name, Data Type, Required, Language-Dependent.

### Set fields (full replacement)

Send ALL 5053 entries — omitted fields are removed:

```json
{
  "branch": "<branch>",
  "objects": [{
    "meta": { "id": "<formId>", "typeRef": 50 },
    "values": [
      { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId1>", "sortReverse": 0 },
      { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId2>", "sortReverse": 1 }
    ]
  }]
}
```

Tool: `novadb_cms_update_objects`. Response: `{ updatedObjects, createdValues, transaction }`.

### Add a field

1. Read the form with `novadb_cms_get_object` (inherited=true)
2. Extract existing 5053 values sorted by `sortReverse`
3. Append the new field ID at the end with the next `sortReverse` value
4. Send the complete set with `novadb_cms_update_objects`

### Remove a field

1. Read the form with `novadb_cms_get_object` (inherited=true)
2. Extract existing 5053 values sorted by `sortReverse`
3. Filter out the field to remove
4. Rebuild `sortReverse` (0, 1, 2, ...) for remaining fields
5. Send the complete set with `novadb_cms_update_objects`

### Create a new form

```json
{
  "branch": "<branch>",
  "objects": [{
    "meta": { "typeRef": 50, "apiIdentifier": "<optional>" },
    "values": [
      { "attribute": 1000, "language": 201, "variant": 0, "value": "Form Name EN" },
      { "attribute": 1000, "language": 202, "variant": 0, "value": "Formularname DE" },
      { "attribute": 5056, "language": 0, "variant": 0, "value": false },
      { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId1>", "sortReverse": 0 },
      { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrDefId2>", "sortReverse": 1 }
    ]
  }]
}
```

Tool: `novadb_cms_create_objects`. Response: `{ createdObjectIds: [<formId>] }`.

After creation, fetch with `novadb_cms_get_object` to confirm.

### Link form to type

See the Form ↔ Object Type Linkage section above. Use `novadb_cms_update_objects` to set attribute 5001 (create form) or 5002 (detail forms) on the type.

---

## Safety: Read Before Write

**Omitting 5053 values in an update removes all fields.** Always:

1. Read the current form state before modifying
2. Merge your changes with the existing values
3. Send the complete value set
4. Verify after write — re-fetch and confirm

---

## Condition System

Forms can be conditionally visible based on attribute values. The condition types (typeRef 170–176) define when a form tab appears:

| Attribute | ID | Purpose |
|-----------|------|---------|
| Condition attribute | 5054 | Which attribute to evaluate (single ObjRef) |
| Condition refs | 5055 | Which values trigger visibility (multi-value ObjRef) |

When attribute 5054 is set on a form, the form tab only appears if the object's value for that attribute matches one of the 5055 references.

---

## CmsValue Structure

```typescript
{
  attribute: number,   // Attribute definition ID
  language: number,    // 201=EN, 202=DE, 0=language-independent
  variant: number,     // 0=default
  value: unknown,      // The actual value
  sortReverse?: number // Multi-value ordering (0, 1, 2, ...)
}
```

---

## API Response Formats

| Method | Response |
|--------|----------|
| POST (create) | `{ transaction, createdObjectIds: number[] }` |
| PATCH (update) | `{ updatedObjects, createdValues, transaction }` |
| DELETE | `{ deletedObjects, transaction }` |
| GET (single) | `CmsObject` |
| GET (list) | `{ objects: CmsObject[] }` |
