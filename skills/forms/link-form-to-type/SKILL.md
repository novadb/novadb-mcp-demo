# Link Form to Type

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
