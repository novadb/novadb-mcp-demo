---
name: add-attribute-to-type
description: "Create a new attribute definition and add it to all forms of an existing object type."
allowed-tools: novadb_cms_get_object, novadb_cms_create_objects, novadb_cms_update_objects
---

# Add Attribute to Type

Create a new attribute definition and add it to all forms of an existing object type. The type must already have a create form.

## Tools Used

- `novadb_cms_get_object` — Fetch type and forms
- `novadb_cms_create_objects` — Create the attribute definition
- `novadb_cms_update_objects` — Update forms with the new field

## Workflow (5 Steps)

### Step 1: Fetch the Object Type

Call `novadb_cms_get_object` with the type ID to read its current form assignments.

### Step 2: Find the Create Form

Extract the create form ID from attribute **5001** in the type's values. If no create form exists, stop with an error — the type must have a create form before attributes can be added.

Also extract detail form IDs from attribute **5002** for later use.

### Step 3: Read Existing Form Fields

Call `novadb_cms_get_object` with the create form ID. Extract the existing field IDs from attribute **5053** (form content). Collect all values where `attribute === 5053` and sort by `sortReverse`.

### Step 4: Create the Attribute Definition

Call `novadb_cms_create_objects` with one attribute definition object:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "typeRef": 10, "apiIdentifier": "<optional-api-id>" },
      "values": [
        { "attribute": 1000, "language": 201, "variant": 0, "value": "Attr Name EN" },
        { "attribute": 1000, "language": 202, "variant": 0, "value": "Attr Name DE" },
        { "attribute": 1001, "language": 0, "variant": 0, "value": "String" }
      ]
    }
  ]
}
```

- `typeRef: 10` = Attribute Definition
- Response: `{ createdObjectIds: [<newAttrDefId>] }`

#### Attribute Definition Values

| Attribute ID | Field | Type | Notes |
|-------------|-------|------|-------|
| 1000 | Name | String | Language-dependent (201=EN, 202=DE) |
| 1001 | Data type | String | See valid data types below |
| 1006 | Required/Predefined | Boolean | Whether values are required |
| 1010 | Has local values | Boolean | |
| 1014 | Max values | Integer | 1=single-value, 0=multi-value |
| 1015 | Allowed types | ObjRef | For ObjRef data type — pass as array value |

#### Valid Data Types

`String`, `TextRef`, `TextRef.JavaScript`, `TextRef.CSS`, `XmlRef.SimpleHtml`, `XmlRef.VisualDocument`, `Integer`, `Decimal`, `Float`, `Boolean`, `DateTime`, `DateTime.Date`, `ObjRef`, `BinRef`, `BinRef.Icon`, `BinRef.Thumbnail`, `String.DataType`, `String.InheritanceBehavior`, `String.UserName`, `String.RGBColor`

### Step 5: Update All Forms

Update the **create form** by replacing all form content (5053) entries with the existing fields plus the new one:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "id": "<formId>", "typeRef": 50 },
      "values": [
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<existingId1>", "sortReverse": 0 },
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<existingId2>", "sortReverse": 1 },
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<newAttrDefId>", "sortReverse": 2 }
      ]
    }
  ]
}
```

**CRITICAL**: Include ALL existing fields plus the new one. Each field is a separate CmsValue entry with incrementing `sortReverse` (0, 1, 2, ...). Never pass an array as the value.

Then repeat for each **detail form** (from attribute 5002) that differs from the create form — fetch it, read its existing fields, and append the new attribute.

## Result

Fetch the newly created attribute definition with `novadb_cms_get_object` and return it to the user along with the form ID it was added to.
