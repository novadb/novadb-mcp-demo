---
name: get-form
description: "Fetch a form and resolve all referenced field attribute definitions."
user-invocable: false
allowed-tools: novadb_cms_get_object, novadb_cms_get_objects
---

# Get Form

## Scope

**This skill ONLY handles:** Fetching a form definition and resolving its field references to attribute definitions.

**For editing form fields** → use `set-form-fields` or `add-form-field`
**For creating new forms** → use `create-form`

Fetch a form with its field attribute definitions resolved. Returns the form object and all referenced field definitions.

## Tools Used

- `novadb_cms_get_object` — Fetch the form
- `novadb_cms_get_objects` — Fetch field attribute definitions in bulk

## Workflow

### Step 1: Fetch the Form

Call `novadb_cms_get_object`:

```json
{
  "branch": "<branch>",
  "objectId": "<formId>",
  "inherited": true
}
```

### Step 2: Extract Field IDs

From the form's `values` array, find all entries with `attribute: 5053`. Sort them by `sortReverse` (ascending) to get the correct field order. Extract the `value` from each — these are the attribute definition IDs.

### Step 3: Fetch Field Definitions

If there are field IDs, call `novadb_cms_get_objects` with a comma-separated list:

```json
{
  "branch": "<branch>",
  "objectIds": "<attrDefId1>,<attrDefId2>,<attrDefId3>",
  "inherited": true
}
```

### Step 4: Return Combined Result

Present the result as `{ form, fields }` where `form` is the full form object and `fields` is the array of resolved attribute definition objects.

## Key Details

- Form content is stored in attribute **5053** as multi-value ObjRef entries
- Sort by `sortReverse` ascending to get the correct field order
- If the form has no fields (no 5053 entries), return an empty `fields` array
- The `formId` parameter accepts an ID, GUID, or ApiIdentifier

## Common Patterns

### ObjRef Resolution
Form field references (attribute 5053) are numeric IDs pointing to attribute definitions. Resolve them using `novadb_cms_get_objects` with `inherited: true`.

### API Response (GET)
Returns a `CmsObject` with `meta` and `values` array containing form properties and field references.
