---
name: nova-create-type
description: >
  Creates new object types in NovaDB — attribute definitions, forms, and the type itself.
  Use when the user wants to define a new data schema, add attributes to a type,
  or set up a complete object type with forms.
---

You have access to the NovaDB MCP server tools. This skill guides you through creating object types, attribute definitions, and forms via the CMS API.

## CMS API Value Format

The CMS API uses **normalized value tuples**, not flat key-value props:

```json
{ "values": [{ "attribute": 1000, "language": 201, "variant": 0, "value": "Example" }] }
```

- `attribute` — Numeric attribute definition ID
- `language` — Language ID (0 for language-independent attributes; 201=en-US, 202=de-DE)
- `variant` — Variant ID (0 for no variant)

## Workflow: Create a Complete Object Type

### 1. Plan the Schema

Before creating anything, clarify with the user:
- Type name (EN + DE) and apiIdentifier
- List of attributes: name, data type, language-dependent?, multi-valued?, required?
- Which attributes appear on the create form vs. detail form(s)
- Any ObjRef attributes: which types can be referenced?

### 2. Create Attribute Definitions

Each attribute is an object of type `typeAttribute` (typeRef: 10).

**Simple string attribute (language-dependent):**
```json
novadb_cms_create_objects(branch, objects=[{
  "meta": { "typeRef": 10, "apiIdentifier": "myAttrName" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "My Attribute (EN)" },
    { "attribute": 1000, "language": 202, "value": "Mein Attribut (DE)" },
    { "attribute": 1001, "value": "String" },
    { "attribute": 1017, "value": true },
    { "attribute": 1018, "value": true }
  ]
}])
```

**ObjRef attribute (single reference):**
```json
{
  "meta": { "typeRef": 10, "apiIdentifier": "myAttrCategory" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "Category" },
    { "attribute": 1000, "language": 202, "value": "Kategorie" },
    { "attribute": 1001, "value": "ObjRef" },
    { "attribute": 1015, "value": [<targetTypeId>] },
    { "attribute": 1004, "value": false }
  ]
}
```

**ObjRef attribute (multi reference):**
```json
{
  "meta": { "typeRef": 10, "apiIdentifier": "myAttrTags" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "Tags" },
    { "attribute": 1000, "language": 202, "value": "Schlagwort" },
    { "attribute": 1001, "value": "ObjRef" },
    { "attribute": 1015, "value": [<targetTypeId>] },
    { "attribute": 1004, "value": true }
  ]
}
```

**Boolean attribute:**
```json
{
  "meta": { "typeRef": 10, "apiIdentifier": "myAttrActive" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "Active" },
    { "attribute": 1000, "language": 202, "value": "Aktiv" },
    { "attribute": 1001, "value": "Boolean" }
  ]
}
```

**Rich text attribute (language-dependent):**
```json
{
  "meta": { "typeRef": 10, "apiIdentifier": "myAttrDescription" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "Description" },
    { "attribute": 1000, "language": 202, "value": "Beschreibung" },
    { "attribute": 1001, "value": "XmlRef.SimpleHtml" },
    { "attribute": 1017, "value": true }
  ]
}
```

**Date attribute:**
```json
{
  "meta": { "typeRef": 10, "apiIdentifier": "myAttrDate" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "Date" },
    { "attribute": 1000, "language": 202, "value": "Datum" },
    { "attribute": 1001, "value": "DateTime.Date" }
  ]
}
```

### Adding Validation Code to Attributes

After creating an attribute, you can add JavaScript validation via attribute 1008 (`attributeValidationCode`, data type `TextRef.JavaScript`). Use `update_objects` to set it:

```json
novadb_cms_update_objects(branch, objects=[{
  "meta": { "id": <attrId>, "typeRef": 10 },
  "values": [
    { "attribute": 1008, "value": "if (value && !/^[^@]+@[^@]+\\.[^@]+$/.test(value)) {\n    \"Invalid email address\";\n}" }
  ]
}])
```

The validation script API:
- `value` — Global variable containing the current attribute value
- Return a **string expression** to reject the value (the string is the error message)
- Return nothing (or falsy) to accept the value

Example patterns from existing NovaDB validations:
```javascript
// Regex validation
if (value && !/^[A-Z]{2}$/.test(value)) {
    "The value must consist of exactly two capital letters.";
}

// Range validation
if (value && value < 0 || value > 999) {
    "The value must be in the range of 0-999.";
}
```

### 3. Create Forms

Forms control which attributes appear in the UI. See nova-forms skill for full form details.

**Create form (shown when creating new objects):**
```json
novadb_cms_create_objects(branch, objects=[{
  "meta": { "typeRef": 50, "apiIdentifier": "myTypeCreateForm" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "Create My Type" },
    { "attribute": 1000, "language": 202, "value": "My Type erstellen" },
    { "attribute": 5053, "value": <attrId1> },
    { "attribute": 5053, "value": <attrId2>, "sortReverse": 1 },
    { "attribute": 5056, "value": false }
  ]
}])
```

**Detail form (shown as tab in edit view):**
```json
novadb_cms_create_objects(branch, objects=[{
  "meta": { "typeRef": 50, "apiIdentifier": "myTypeDetailForm" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "General" },
    { "attribute": 1000, "language": 202, "value": "Allgemein" },
    { "attribute": 5053, "value": <attrId1> },
    { "attribute": 5053, "value": <attrId2>, "sortReverse": 1 },
    { "attribute": 5053, "value": <attrId3>, "sortReverse": 2 },
    { "attribute": 5056, "value": false }
  ]
}])
```

### 4. Create the Object Type

Object types are instances of `root` (typeRef: 0).

```json
novadb_cms_create_objects(branch, objects=[{
  "meta": { "typeRef": 0, "apiIdentifier": "myCustomType" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "My Custom Type" },
    { "attribute": 1000, "language": 202, "value": "Mein Typ" },
    { "attribute": 5001, "value": <createFormId> },
    { "attribute": 5002, "value": [<detailFormId>] },
    { "attribute": 5005, "value": <displayNameAttrId> }
  ]
}])
```

### 5. (Optional) Create an Application Area

Application Areas group object types in the UI navigation. Create one with typeRef: 60.

```json
novadb_cms_create_objects(branch, objects=[{
  "meta": { "typeRef": 60, "apiIdentifier": "myAppArea" },
  "values": [
    { "attribute": 1000, "language": 201, "value": "My Area" },
    { "attribute": 1000, "language": 202, "value": "Mein Bereich" },
    { "attribute": 6001, "value": [<typeId>] },
    { "attribute": 6003, "value": 100 }
  ]
}])
```

### 6. Verify

After creation, verify with the CMS API:
```
# Fetch the new type
novadb_cms_get_object(branch, id=<newTypeId>, inherited=true)
# Resolve form references (objectTypeCreateForm=5001, objectTypeDetailForms=5002)
novadb_cms_get_objects(branch, ids="<createFormId>,<detailFormId>")
```

## Property Data Types Reference

| Data Type | Example Value | Notes |
|-----------|--------------|-------|
| `String` | `"Hello World"` | Plain text, may be language-dependent |
| `TextRef` | `"Long description..."` | Long/rich text |
| `TextRef.JavaScript` | `"function() { ... }"` | JavaScript code |
| `TextRef.CSS` | `"body { color: #000; }"` | CSS stylesheet code |
| `XmlRef.SimpleHtml` | `{"XML": "<div>...</div>"}` | Rich text (XHTML) |
| `XmlRef.VisualDocument` | `{"id": "...", "type": "group", ...}` | Visual component trees |
| `Integer` | `42` | Whole numbers |
| `Decimal` | `3.14` | Decimal numbers |
| `Boolean` | `true` / `false` | Checkbox values |
| `DateTime.Date` | `"2026-01-08"` | Date only |
| `ObjRef` | `2099001` or `[2099001, 2099002]` | Reference(s) to other objects |
| `BinRef.Icon` | (binary) | Icon image upload |
| `BinRef.Thumbnail` | (binary) | Thumbnail image |
| `String.DataType` | `"ObjRef"` | Enumerated data type selector |
| `String.InheritanceBehavior` | `"None"` | Inheritance mode selector |
| `String.UserName` | `"john.doe"` | User name picker |

## Attribute Definition Properties (typeAttribute)

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 1000 | `attributeName` | String | Name (language-dependent, required) |
| 1001 | `attributeDataType` | String.DataType | Data type (required) |
| 1004 | `attributeAllowMultiple` | Boolean | Multi-valued |
| 1006 | `attributePredefined` | Boolean | Has predefined values |
| 1008 | `attributeValidationCode` | TextRef.JavaScript | JavaScript validation (`value` global, return string to reject) |
| 1012 | `attributeDescription` | TextRef | Description (language-dependent) |
| 1013 | `attributeInheritanceBehavior` | String.InheritanceBehavior | None / Inheriting / InheritingAll |
| 1015 | `attributeReferencedObjectTypes` | ObjRef (multi) | Allowed types for ObjRef |
| 1017 | `attributeLanguageDependent` | Boolean | Localized values |
| 1018 | `attributeRequired` | Boolean | Value required |
| 1019 | `attributeParentGroup` | ObjRef | Parent attribute group |
| 1020 | `attributeVirtual` | Boolean | Computed by JavaScript |
| 1021 | `attributeApiIdentifier` | String | API identifier (unique) |
| 1032 | `attributeUniqueValues` | Boolean | Unique constraint |

## Object Type Properties (root)

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 5001 | `objectTypeCreateForm` | ObjRef | Create form |
| 5002 | `objectTypeDetailForms` | ObjRef (multi) | Detail form tabs |
| 5005 | `objectTypeDisplayNameAttribute` | ObjRef | Attribute used for display name |
| 5006 | `objectTypeDisplayIconAttribute` | ObjRef | Attribute used for display icon |
| 5008 | `objectTypeThumbnailAttribute` | ObjRef | Attribute used for thumbnails |
| 5009 | `objectTypeBinaryProxy` | Boolean | Enables binary file uploads |

## Application Area Properties (typeApplicationArea)

| ID | apiIdentifier | Data Type | Notes |
|----|--------------|-----------|-------|
| 6001 | `applicationAreaObjectTypes` | ObjRef (multi) | Object types in this area |
| 6003 | `applicationAreaSortKey` | Integer | Sort order |

## Gotchas

- **`apiIdentifier` is immutable** — Must be set in `meta.apiIdentifier` during `create_objects`. Cannot be changed later (HTTP 403). If wrong, delete and recreate.
- **`attributeName` (1000) is language-dependent** — Always provide one value per language (201=en-US, 202=de-DE).
- **`formContent` (5053) uses individual entries, NOT arrays** — Each attribute reference must be a separate value entry with `"attribute": 5053` and a single `"value"`. Use `sortReverse` (0, 1, 2, ...) to control field order. Passing an array like `[id1, id2]` causes HTTP 400.
- **`objectTypeDetailForms` (5002) is an array** — When adding a form to a type that already has detail forms, first read the existing array, then append and update. Never overwrite with just the new form ID.
- **Use `typeRef: 10`** for attributes, `typeRef: 50` for forms, `typeRef: 0` for object types.
- **CMS uses numeric attribute IDs**, not apiIdentifier strings. Always use the ID numbers from the tables above.
