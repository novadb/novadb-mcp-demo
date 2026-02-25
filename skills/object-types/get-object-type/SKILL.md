---
name: get-object-type
description: "Fetch an object type with all its attribute definitions resolved via forms."
allowed-tools: novadb_cms_get_object, novadb_cms_get_objects
---

# Get Object Type

Fetch an object type with all its attribute definitions resolved via forms. Follows the Type → Form → Attribute Definition chain.

**Don't have a type ID?** Search Application Areas (`objectTypeIds: [60]`) by domain name, then read attribute 6001 for linked type IDs.

## Tools Used

- `novadb_cms_get_object` — Fetch type and individual forms
- `novadb_cms_get_objects` — Fetch attribute definitions in bulk

## Workflow (4 Steps)

### Step 1: Fetch the Type

Call `novadb_cms_get_object` with the type ID:

```json
{
  "branch": "<branch>",
  "objectId": "<typeId>",
  "inherited": true
}
```

### Step 2: Extract Form IDs

From the type's `values` array, extract:

- **Create form** (attribute 5001): single ObjRef value
- **Detail forms** (attribute 5002): multi-value ObjRef entries (may have multiple with different `sortReverse`)

Collect all unique form IDs from both attributes.

### Step 3: Fetch Forms and Extract Field IDs

For each form ID, call `novadb_cms_get_object` to fetch the form, then extract field IDs from attribute **5053** (form content).

Form content uses the multi-value ObjRef pattern — look for all values where `attribute === 5053` and collect their `value` fields. Sort by `sortReverse` to preserve ordering.

Deduplicate field IDs across all forms.

### Step 4: Fetch Attribute Definitions

If any field IDs were found, call `novadb_cms_get_objects` with the comma-separated list of attribute definition IDs:

```json
{
  "branch": "<branch>",
  "objectIds": "<id1>,<id2>,<id3>",
  "inherited": true
}
```

## Result

Return both the object type and its resolved attribute definitions to the user.

## Key Attribute IDs

| Purpose | Attribute ID | Pattern |
|---------|-------------|---------|
| Create form | 5001 | Single ObjRef on type |
| Detail forms | 5002 | Multi-value ObjRef on type |
| Form content (fields) | 5053 | Multi-value ObjRef on form |

## Edge Case

If the type has no forms (5001/5002 values missing), return the type with an empty attribute definitions list.
