# NovaDB MCP Server

> **IMPORTANT: Always think and write in English — regardless of the language the user uses to ask questions or give instructions. All responses, comments, code, and documentation must be in English.**

MCP (Model Context Protocol) server that exposes NovaDB CMS and Index APIs as tools for AI assistants.

## Quick Reference

```bash
npm run build          # Compile TypeScript → dist/
npm run start          # Run the MCP server (stdio transport)
npm test               # Run all tests (vitest)
npm run test:watch     # Watch mode
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `NOVA_HOST` | Base URL (auto-prefixed with `https://` if missing) |
| `NOVA_CMS_USER` | CMS API username |
| `NOVA_CMS_PASSWORD` | CMS API password |
| `NOVA_INDEX_USER` | Index API username |
| `NOVA_INDEX_PASSWORD` | Index API password |

## Architecture

```
src/
├── index.ts                    # Entry point — creates McpServer, registers all tools, connects StdioTransport
├── http-client.ts              # ApiClient class (Basic Auth, GET/POST/PATCH/DELETE/FormData)
├── cms-api/
│   ├── client.ts               # CMS API client — typed methods + CmsValue/CmsObject/Response interfaces
│   └── tools.ts                # All CMS tool registrations
├── index-api/
│   ├── client.ts               # Index API client — search, count, occurrences, suggestions
│   └── tools.ts                # All Index tool registrations
skills/                         # SKILL.md prompt-instruction files (AI workflow guidance)
tests/
└── fixtures/
    ├── constants.ts             # All attribute IDs, typeRef constants, language IDs
    ├── helpers.ts               # Multi-value ObjRef extraction/building utilities
    └── ...                      # Test context, cleanup, setup
```

### Key Types

```typescript
interface CmsValue {
  attribute: number;
  variant?: number;
  language?: number;
  value?: unknown;
  sortReverse?: number | null;  // Multi-value ordering
  unitRef?: number | null;
}

interface CmsObject {
  meta: CmsObjectMeta;  // { id, guid, apiIdentifier, typeRef, ... }
  values?: CmsValue[];
}
```

## Critical Conventions

- **Multi-value ObjRef**: Separate `CmsValue` entries with `sortReverse`, NOT arrays (see rules/novadb-api-conventions.md)
- **Comment body**: Must be XHTML with `<div>` root element
- **Code generator**: Only `"csharp"` language is supported
- **API responses differ by method**: POST returns `createdObjectIds`, PATCH returns `updatedObjects` count, DELETE returns `deletedObjects` count

## Debugging API Issues

When encountering unclear API errors, test directly with `curl` and Basic Auth to inspect the raw response. Credentials are in the `NOVA_*` environment variables:

```bash
# CMS API — GET
curl -u "$NOVA_CMS_USER:$NOVA_CMS_PASSWORD" \
  "https://$NOVA_HOST/cms/branches/2100347/objects/12345"

# CMS API — POST with body
curl -u "$NOVA_CMS_USER:$NOVA_CMS_PASSWORD" \
  -X POST -H "Content-Type: application/json" \
  -d '{"values":[...]}' \
  "https://$NOVA_HOST/cms/branches/2100347/objects"

# Index API
curl -u "$NOVA_INDEX_USER:$NOVA_INDEX_PASSWORD" \
  "https://$NOVA_HOST/index/objects?query=MCP-*&limit=10"
```

This quickly reveals whether an error originates in the API client code or in the API itself.

## Dependencies

- `@modelcontextprotocol/sdk` — MCP protocol implementation
- `zod` — Schema validation for tool inputs
- `typescript` / `tsx` — Build and runtime
- `vitest` — Testing framework
