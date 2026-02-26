---
name: link-form-to-type
description: "Attach a form to an object type as create form or detail tab."
user-invocable: false
allowed-tools: novadb_cms_update_objects, novadb_cms_get_object
---

# Link Form to Type

## Scope

**This skill ONLY handles:** Linking an existing form to an object type as either the create form (attribute 5001) or a detail tab (attribute 5002).

**For creating new forms** → use `create-form`
**For editing form fields** → use `set-form-fields` or `add-form-field`

Attach a form to an object type as either a **create form** (shown when creating new objects) or a **detail tab** (shown in the edit view).

## Tools Used

- `novadb_cms_update_objects` — Set form reference on the type
- `novadb_cms_get_object` — (detail role only) Read existing detail forms before appending

## Two Roles

### Create Form (attr 5001)

A type has a single create form. Setting it replaces any previous create form.

Call `novadb_cms_update_objects`:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "id": "<typeId>", "typeRef": 0 },
      "values": [
        { "attribute": 5001, "language": 0, "variant": 0, "value": "<formId>" }
      ]
    }
  ]
}
```

- `typeRef: 0` = Object Type
- `5001` = Create form (single ObjRef — just set it directly)

### Detail Tab (attr 5002)

A type can have multiple detail forms (tabs). New forms are **appended** to the existing list.

#### Step 1: Read Existing Detail Forms

Call `novadb_cms_get_object` to fetch the type (branch, typeId, inherited=true). Extract all values with `attribute: 5002`, sort by `sortReverse` ascending, and collect their `value` (form IDs).

#### Step 2: Append and Update

Add the new form ID to the list. Rebuild ALL 5002 entries with correct `sortReverse` ordering.

Call `novadb_cms_update_objects`:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "id": "<typeId>", "typeRef": 0 },
      "values": [
        { "attribute": 5002, "language": 0, "variant": 0, "value": "<existingFormId1>", "sortReverse": 0 },
        { "attribute": 5002, "language": 0, "variant": 0, "value": "<existingFormId2>", "sortReverse": 1 },
        { "attribute": 5002, "language": 0, "variant": 0, "value": "<newFormId>", "sortReverse": 2 }
      ]
    }
  ]
}
```

- `5002` = Detail forms (multi-value ObjRef with `sortReverse`)
- Each form is a separate CmsValue entry — never pass an array as the value

## Response

Returns `{ updatedObjects, createdValues, transaction }`.

## Common Patterns

### Multi-Value ObjRef (Detail Forms)
Detail forms (attribute 5002) use multi-value ObjRef pattern with sortReverse:
- ✓ `{ attr: 5002, value: formId1, sortReverse: 0 }, { attr: 5002, value: formId2, sortReverse: 1 }`
- ✗ `{ attr: 5002, value: [formId1, formId2] }`

Create form (attribute 5001) is single-value — no sortReverse needed.

### Read-Modify-Write Pattern (Detail Forms)
1. Read current type to get existing detail forms from attribute 5002
2. Append new form with next sortReverse value
3. Send complete form list back

### API Response (PATCH/Update)
Returns `{ transaction }`. Fetch the object type afterward to confirm changes.
