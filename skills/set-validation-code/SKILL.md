---
name: set-validation-code
description: "Set JavaScript validation code on an attribute definition."
user-invocable: false
allowed-tools: novadb_cms_update_objects
---

# Set Validation Code

## Scope

**This skill ONLY handles:** Setting JavaScript validation code (attribute 1008) on an existing attribute definition.

**For virtualization code** → use `set-virtualization-code`
**For other attribute property changes** → use `update-attribute`

Set JavaScript validation code on an attribute definition. The script validates user input server-side.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_cms_update_objects`

## Parameters

```json
{
  "branch": "draft",
  "objects": [
    {
      "meta": { "id": 12345, "typeRef": 10 },
      "values": [
        { "attribute": 1008, "language": 0, "variant": 0, "value": "if (value && !/^[A-Z]{2}$/.test(value)) { 'Must be exactly 2 capital letters'; }" }
      ]
    }
  ],
  "comment": "Added country code validation"
}
```

- `branch` — Branch ID or `"draft"`
- `objects[0].meta.id` — Attribute definition ID
- `objects[0].meta.typeRef` — Always `10`
- `objects[0].values[0].attribute` — Always `1008` (validation code)
- `objects[0].values[0].value` — JavaScript validation script
- `comment` / `username` — (optional) Audit trail

## Validation Script Pattern

The script receives `value` as a global variable containing the user's input.

- **Return a string** to reject the value — the string becomes the error message
- **Return nothing** (or falsy) to accept the value

### Examples

```javascript
// Reject if not exactly 2 uppercase letters
if (value && !/^[A-Z]{2}$/.test(value)) {
  'Must be exactly 2 capital letters';
}
```

```javascript
// Reject negative numbers
if (value < 0) {
  'Value must be non-negative';
}
```

```javascript
// Reject empty strings
if (typeof value === 'string' && value.trim() === '') {
  'Value must not be empty';
}
```

## Response

Returns `{ updatedObjects, createdValues, transaction }`.

## Common Patterns

### CmsValue Format
Every value entry follows: `{ attribute, language, variant, value }`
- `language`: 0=language-independent (always 0 for code attributes)
- `variant`: 0=default

### API Response (PATCH/Update)
Returns `{ transaction }`. Fetch the object afterward to confirm changes.
