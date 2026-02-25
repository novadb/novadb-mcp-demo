---
name: get-attribute
description: "Fetch a single attribute definition with all inherited properties."
allowed-tools: novadb_cms_get_object
---

# Get Attribute

Fetch a single attribute definition with all inherited properties.

> **Note:** NovaDB object IDs start at 2²¹ (2,097,152). All IDs in examples below are samples — always use real IDs from your system.

## Tool

`novadb_cms_get_object`

## Parameters

```json
{
  "branch": "draft",
  "objectId": "12345",
  "inherited": true
}
```

- `branch` — Branch ID or `"draft"`
- `objectId` — Attribute ID, GUID, or ApiIdentifier (string)
- `inherited` — Set to `true` to include inherited values

## Response

Returns a `CmsObject` with `meta` (id, guid, apiIdentifier, typeRef=10) and `values` array containing all attribute properties.
