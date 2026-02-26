---
name: set-virtualization-code
description: "Set JavaScript virtualization code on a virtual attribute."
user-invocable: false
allowed-tools: novadb_cms_update_objects
---

# Set Virtualization Code

## Scope

**This skill ONLY handles:** Setting JavaScript virtualization code (attribute 1009) on an existing virtual attribute definition.

**For validation code** → use `set-validation-code`
**For other attribute property changes** → use `update-attribute`

Set JavaScript code that computes a virtual attribute's value server-side. The attribute must have `isVirtual=true` (attribute 1020) for this code to take effect.

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
        { "attribute": 1009, "language": 0, "variant": 0, "value": "// compute value here" }
      ]
    }
  ],
  "comment": "Set virtualization logic"
}
```

- `branch` — Branch ID or `"draft"`
- `objects[0].meta.id` — Attribute definition ID
- `objects[0].meta.typeRef` — Always `10`
- `objects[0].values[0].attribute` — Always `1009` (virtualization code)
- `objects[0].values[0].value` — JavaScript computation script
- `comment` / `username` — (optional) Audit trail

## Prerequisite

The attribute must be marked as virtual (`isVirtual=true`, attribute 1020). If it is not, first update the attribute to set it as virtual before setting virtualization code.

## Response

Returns `{ updatedObjects, createdValues, transaction }`.

## Common Patterns

### CmsValue Format
Every value entry follows: `{ attribute, language, variant, value }`
- `language`: 0=language-independent (always 0 for code attributes)
- `variant`: 0=default

### API Response (PATCH/Update)
Returns `{ transaction }`. Fetch the object afterward to confirm changes.
