# Tool Development Guide

How to add new MCP tools to the NovaDB MCP server.

## File Structure

Each domain follows this layout:

```
src/extensions/<domain>/
├── index.ts              # register<Domain>Tools(server, cms, index) — aggregates all tools
├── shared.ts             # Shared schemas, value builders, enums (optional)
├── create-<entity>.ts    # registerCreate<Entity>Tool(server, cms, index)
├── update-<entity>.ts    # registerUpdate<Entity>Tool(server, cms, index)
├── get-<entity>.ts       # registerGet<Entity>Tool(server, cms, index)
└── delete-<entity>.ts    # registerDelete<Entity>Tool(server, cms, index)
```

## Tool Registration Pattern

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CmsClient } from "../../cms-api/client.js";
import { IndexClient } from "../../index-api/client.js";

export function registerMyTool(
  server: McpServer,
  cms: CmsClient,
  _index: IndexClient  // Prefix unused params with _
): void {
  server.tool(
    "novadb_my_tool",              // Tool name: novadb_ prefix + snake_case
    "Clear description of what this tool does",
    {
      // Zod schema — every field MUST have .describe()
      branch: z.string().describe("Branch ID or 'draft' for the main branch"),
      name: z.string().describe("Display name of the entity"),
      typeId: z.number().optional().describe("Optional type reference ID"),
    },
    async (input) => {
      const result = await cms.someMethod(input.branch, ...);

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
```

## Conventions

### Naming

- Tool names: `novadb_` prefix + `snake_case` (e.g. `novadb_cms_get_object`)
- Registration functions: `register<Name>Tool`
- Domain aggregators: `register<Domain>Tools`

### Zod Schemas

- **Every field** must have `.describe()` — this is the only documentation AI assistants see
- **`branch` parameter**: Always `z.string().describe("Branch ID or 'draft' for the main branch")`
- **Optional audit fields**: `comment` and `username` as `z.string().optional()`
- **Shared schemas**: Use `.extend()` to add fields to base schemas (see `attributeInputSchema`)

### Value Builders

Build `CmsValue[]` arrays with conditional push to only include provided values:

```typescript
function buildValues(input: Input): CmsValue[] {
  const values: CmsValue[] = [];

  // Always include required values
  values.push({ attribute: ATTR_NAME, language: LANG_EN, variant: 0, value: input.nameEn });

  // Conditionally include optional values
  if (input.nameDe !== undefined) {
    values.push({ attribute: ATTR_NAME, language: LANG_DE, variant: 0, value: input.nameDe });
  }

  // Multi-value ObjRef: separate entries with sortReverse
  if (input.fieldIds) {
    input.fieldIds.forEach((id, i) => {
      values.push({ attribute: ATTR_FORM_CONTENT, language: 0, variant: 0, value: id, sortReverse: i });
    });
  }

  return values;
}
```

### Return Format

Always return JSON as text content:

```typescript
return {
  content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
};
```

For errors, throw or return error text — the MCP SDK handles error propagation.

## Wiring a New Tool

1. Create the tool file in the appropriate `src/extensions/<domain>/` directory
2. Export the `register<Name>Tool` function
3. Call it from the domain's `index.ts` inside `register<Domain>Tools()`
4. If it's a new domain, call `register<Domain>Tools()` from `src/index.ts`
