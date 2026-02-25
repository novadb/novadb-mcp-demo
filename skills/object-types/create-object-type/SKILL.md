---
name: create-object-type
description: "Create an object type with optional inline attribute definitions in NovaDB. Multi-step workflow."
allowed-tools: novadb_cms_create_objects, novadb_cms_update_objects, novadb_cms_get_object
---

# Create Object Type

Create an object type with optional inline attribute definitions in NovaDB. This is a multi-step workflow that creates the type, attribute definitions, a form, and links everything together.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools Used

- `novadb_cms_create_objects` — Create type, attribute definitions, and form
- `novadb_cms_update_objects` — Link form to type
- `novadb_cms_get_object` — Fetch created objects for confirmation

## Workflow (5 Steps)

### Step 1: Create the Object Type

Call `novadb_cms_create_objects` with one object:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "typeRef": 0, "apiIdentifier": "<optional-api-id>" },
      "values": [
        { "attribute": 1000, "language": 201, "variant": 0, "value": "English Name" },
        { "attribute": 1000, "language": 202, "variant": 0, "value": "German Name" },
        { "attribute": 1012, "language": 201, "variant": 0, "value": "English Description" },
        { "attribute": 1012, "language": 202, "variant": 0, "value": "German Description" }
      ]
    }
  ]
}
```

- `typeRef: 0` = Object Type
- Only include language/description values that are provided
- Response: `{ createdObjectIds: [<typeId>] }`

### Step 2: Create Attribute Definitions (if any)

If the user wants attributes on the type, call `novadb_cms_create_objects` with one object per attribute:

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
- Response: `{ createdObjectIds: [<attrId1>, <attrId2>, ...] }`

#### Attribute Definition Values

| Attribute ID | Field | Type | Notes |
|-------------|-------|------|-------|
| 1000 | Name | String | Language-dependent (201=EN, 202=DE) |
| 1001 | Data type | String | See data types below |
| 1006 | Required/Predefined | Boolean | Whether values are required |
| 1010 | Has local values | Boolean | |
| 1014 | Max values | Integer | 1=single-value, 0=multi-value |
| 1015 | Allowed types | ObjRef | For ObjRef data type — pass as array value |

#### Valid Data Types

`String`, `TextRef`, `TextRef.JavaScript`, `TextRef.CSS`, `XmlRef.SimpleHtml`, `XmlRef.VisualDocument`, `Integer`, `Decimal`, `Float`, `Boolean`, `DateTime`, `DateTime.Date`, `ObjRef`, `BinRef`, `BinRef.Icon`, `BinRef.Thumbnail`, `String.DataType`, `String.InheritanceBehavior`, `String.UserName`, `String.RGBColor`

### Step 3: Create a Form

Call `novadb_cms_create_objects` with one form object linking to the attribute definitions:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "typeRef": 50 },
      "values": [
        { "attribute": 1000, "language": 201, "variant": 0, "value": "English Name" },
        { "attribute": 1000, "language": 202, "variant": 0, "value": "German Name" },
        { "attribute": 5056, "language": 0, "variant": 0, "value": false },
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrId1>", "sortReverse": 0 },
        { "attribute": 5053, "language": 0, "variant": 0, "value": "<attrId2>", "sortReverse": 1 }
      ]
    }
  ]
}
```

- `typeRef: 50` = Form
- `5056` = isSingleEditor (set to `false`)
- `5053` = Form content — **one separate entry per attribute with `sortReverse` for ordering**
- Use the same name as the object type for the form
- Response: `{ createdObjectIds: [<formId>] }`

**CRITICAL**: Form content (5053) uses multi-value ObjRef pattern. Each field is a separate CmsValue entry with incrementing `sortReverse` (0, 1, 2, ...). Never pass an array as the value.

### Step 4: Link Form to Type

Call `novadb_cms_update_objects` to set the form as both create form and detail tab:

```json
{
  "branch": "<branch>",
  "objects": [
    {
      "meta": { "id": "<typeId>", "typeRef": 0 },
      "values": [
        { "attribute": 5001, "language": 0, "variant": 0, "value": "<formId>" },
        { "attribute": 5002, "language": 0, "variant": 0, "value": "<formId>", "sortReverse": 0 }
      ]
    }
  ]
}
```

- `5001` = Create form (single ObjRef)
- `5002` = Detail forms (multi-value ObjRef with `sortReverse`)

### Step 5: Fetch and Return

Fetch the created type with `novadb_cms_get_object` (branch, typeId) and the attribute definitions with `novadb_cms_get_objects` (branch, comma-separated attrDefIds) to confirm and return the results.

## Minimum Required

Only `nameEn` (attribute 1000, language 201) is required. All other fields — German name, descriptions, attribute definitions — are optional.

## Skip Steps 2–4

If no attribute definitions are requested, skip steps 2–4 entirely. Just create the bare type in step 1 and fetch it in step 5.
