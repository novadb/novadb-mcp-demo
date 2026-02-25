---
name: create-attribute
description: "Create an attribute definition (typeRef=10) in NovaDB. Supports all data types, multi-value, ObjRef constraints, language-dependence, and optional JS validation."
allowed-tools: novadb_cms_create_objects, novadb_cms_get_object
---

# Create Attribute

Create an attribute definition (typeRef=10) in NovaDB. Supports all data types, multi-value, ObjRef constraints, language-dependence, and optional JS validation.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tools

1. `novadb_cms_create_objects` — Create the attribute definition
2. `novadb_cms_get_object` — Fetch the created attribute to return full data

## Step 1: Create the attribute

Call `novadb_cms_create_objects` with:

- `branch` — Branch ID or `"draft"`
- `objects` — Array with one object: `{ meta: { typeRef: 10, apiIdentifier: "..." }, values: [...] }`
- `comment` / `username` — (optional) Audit trail

### Attribute Property IDs

Only include values for fields you want to set. Name (EN) and data type are always required.

| Field | Attr ID | Type | Language | Notes |
|-------|---------|------|----------|-------|
| Name (EN) | 1000 | String | 201 | **Required** |
| Name (DE) | 1000 | String | 202 | |
| Description (EN) | 1012 | TextRef | 201 | |
| Description (DE) | 1012 | TextRef | 202 | |
| Data type | 1001 | String.DataType | 0 | **Required** — see enum below |
| Language dependent | 1017 | Boolean | 0 | **Required** |
| Required | 1018 | Boolean | 0 | |
| Allow multiple | 1004 | Boolean | 0 | |
| Predefined values | 1006 | Boolean | 0 | |
| Unique values | 1032 | Boolean | 0 | |
| Allowed types | 1015 | ObjRef | 0 | For ObjRef data type — one entry per type ID with `sortReverse` |
| Inheritance behavior | 1013 | String | 0 | `"None"` / `"Inheriting"` / `"InheritingAll"` |
| Virtual | 1020 | Boolean | 0 | |
| Parent group | 1019 | ObjRef | 0 | |
| Sortable values | 1005 | Boolean | 0 | |
| Format string | 1007 | String | 0 | e.g. `"dd.MM.yyyy"` |
| Search filter | 1010 | Boolean | 0 | |
| List view column | 1011 | Boolean | 0 | |
| Variant axis | 1002 | ObjRef | 0 | |
| Unit of measure | 1003 | ObjRef | 0 | Ref type 30 |
| Reverse relation name (EN) | 1051 | String | 201 | |
| Reverse relation name (DE) | 1051 | String | 202 | |
| Sortable child objects | 1023 | Boolean | 0 | |
| Disable spell checking | 1028 | Boolean | 0 | |
| Validation code | 1008 | TextRef.JS | 0 | JS: receives `value` global, return string to reject |
| Virtualization code | 1009 | TextRef.JS | 0 | Requires `isVirtual: true` |

### Data Type Enum

Valid values for attribute 1001:

```
String, TextRef, TextRef.JavaScript, TextRef.CSS,
XmlRef.SimpleHtml, XmlRef.VisualDocument,
Integer, Decimal, Float, Boolean,
DateTime, DateTime.Date,
ObjRef, BinRef, BinRef.Icon, BinRef.Thumbnail,
String.DataType, String.InheritanceBehavior, String.UserName, String.RGBColor
```

### Value Construction Example

```json
{
  "branch": "draft",
  "objects": [
    {
      "meta": { "typeRef": 10, "apiIdentifier": "my-attr" },
      "values": [
        { "attribute": 1000, "language": 201, "variant": 0, "value": "Industry" },
        { "attribute": 1000, "language": 202, "variant": 0, "value": "Branche" },
        { "attribute": 1001, "language": 0, "variant": 0, "value": "String" },
        { "attribute": 1017, "language": 0, "variant": 0, "value": false },
        { "attribute": 1018, "language": 0, "variant": 0, "value": true },
        { "attribute": 1004, "language": 0, "variant": 0, "value": false }
      ]
    }
  ],
  "comment": "Created via AI assistant"
}
```

### ObjRef with Allowed Types Example

For an ObjRef attribute that references specific types, use separate entries with `sortReverse`:

```json
{
  "values": [
    { "attribute": 1001, "language": 0, "variant": 0, "value": "ObjRef" },
    { "attribute": 1015, "language": 0, "variant": 0, "value": 12345, "sortReverse": 0 },
    { "attribute": 1015, "language": 0, "variant": 0, "value": 67890, "sortReverse": 1 }
  ]
}
```

## Step 2: Fetch the created attribute

The POST response returns `{ transaction, createdObjectIds: [id] }`. Use the first ID to fetch the full object:

```json
{
  "branch": "draft",
  "objectId": "<createdObjectIds[0]>",
  "inherited": true
}
```

Return the fetched `CmsObject` to the user.

## Minimum Required

- Name in English (attribute 1000, language 201)
- Data type (attribute 1001)
- Language dependent flag (attribute 1017)
