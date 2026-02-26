# Architecture

## Overview

NovaDB MCP Server is a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes NovaDB CMS and Index APIs as tools for AI assistants. It uses stdio transport and registers tools for object CRUD, search, branching, comments, jobs, files, and code generation.

## Project Structure

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
├── extensions/
│   └── <domain>/               # Domain-specific tool registrations (attributes, forms, jobs, etc.)
│       ├── index.ts            # register<Domain>Tools() — aggregates all tools in the domain
│       ├── shared.ts           # Shared schemas, value builders, enums
│       ├── create-<entity>.ts  # Individual tool registration functions
│       ├── update-<entity>.ts
│       ├── get-<entity>.ts
│       └── delete-<entity>.ts
skills/                         # SKILL.md prompt-instruction files (AI workflow guidance)
agents/                         # Agent definitions for Haiku subagents
tests/
├── setup.ts                    # Shared test setup (env validation, client factories)
└── fixtures/
    ├── constants.ts            # All attribute IDs, typeRef constants, language IDs
    ├── helpers.ts              # Multi-value ObjRef extraction/building utilities
    └── test-context.ts         # Lazy singleton test fixture manager
```

## Key Types

```typescript
interface CmsValue {
  attribute: number;           // Attribute definition ID
  variant?: number;            // Variant axis (0 = default)
  language?: number;           // Language ID (201=EN, 202=DE, 0=language-independent)
  value?: unknown;             // The actual value
  sortReverse?: number | null; // Multi-value ordering (0, 1, 2, …)
  unitRef?: number | null;     // Unit of measure reference (rarely used)
}

interface CmsObjectMeta {
  id: number;                  // Object ID (starts at 2²¹ = 2,097,152)
  guid: string;                // Globally unique identifier
  apiIdentifier: string;       // Human-readable API identifier
  typeRef: number;             // Type reference (0=ObjectType, 10=AttrDef, 40=Branch, 50=Form, 60=AppArea)
}

interface CmsObject {
  meta: CmsObjectMeta;
  values?: CmsValue[];
}
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NOVA_HOST` | Base URL (auto-prefixed with `https://` if missing) |
| `NOVA_CMS_USER` | CMS API username |
| `NOVA_CMS_PASSWORD` | CMS API password |
| `NOVA_INDEX_USER` | Index API username |
| `NOVA_INDEX_PASSWORD` | Index API password |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@modelcontextprotocol/sdk` | MCP protocol implementation |
| `zod` | Schema validation for tool inputs |
| `typescript` / `tsx` | Build and runtime |
| `vitest` | Testing framework |

## Build and Run

```bash
npm run build          # Compile TypeScript → dist/
npm run start          # Run the MCP server (stdio transport)
npm test               # Run all tests (vitest)
npm run test:watch     # Watch mode
```
