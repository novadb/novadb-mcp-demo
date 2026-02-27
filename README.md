# NovaDB MCP Server

An MCP (Model Context Protocol) server for NovaDB CMS and Index APIs, enabling AI assistants to interact with NovaDB content management and data indexing systems.

## Overview

This server provides a comprehensive interface to NovaDB's core features through the Model Context Protocol. It exposes tools for managing content, object types, attributes, forms, branches, comments, files, jobs, and indexed data.

## Features

- **CMS API Integration**: Direct access to NovaDB CMS operations (objects, branches, comments, files, jobs)
- **Index API Integration**: Full-featured data indexing, search, and retrieval

## Installation

```bash
npm install
```

## Configuration

Set the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NOVA_HOST` | Base URL for NovaDB instance (auto-prefixed with `https://` if missing) | Yes |
| `NOVA_CMS_USER` | Username for CMS API authentication | Yes |
| `NOVA_CMS_PASSWORD` | Password for CMS API authentication | Yes |
| `NOVA_INDEX_USER` | Username for Index API authentication | Yes |
| `NOVA_INDEX_PASSWORD` | Password for Index API authentication | Yes |

### Example

```bash
export NOVA_HOST="novadb.example.com"
export NOVA_CMS_USER="cms_user"
export NOVA_CMS_PASSWORD="cms_password"
export NOVA_INDEX_USER="index_user"
export NOVA_INDEX_PASSWORD="index_password"
```

## Development

### Build

```bash
npm run build
```

Compiles TypeScript source files from `src/` to `dist/`.

### Start

```bash
npm start
```

Runs the MCP server using tsx (stdio transport).

### Testing

```bash
npm test              # Run all tests (vitest)
npm run test:watch    # Watch mode
```

Tests are integration tests that require the `NOVA_*` environment variables. They skip gracefully when variables are missing.

### Build Packaging

```bash
npm run build:ext      # Build Claude extension (.mcpb)
```

## Project Structure

```
novadb-mcp/
├── src/
│   ├── index.ts              # Entry point — registers tools, connects StdioTransport
│   ├── http-client.ts        # ApiClient class (Basic Auth, GET/POST/PATCH/DELETE)
│   ├── cms-api/
│   │   ├── client.ts         # CMS API client — typed methods + interfaces
│   │   └── tools.ts          # All CMS tool registrations
│   └── index-api/
│       ├── client.ts         # Index API client — search, count, suggestions
│       └── tools.ts          # All Index tool registrations
├── tests/
│   ├── setup.ts              # Shared test setup and environment validation
│   ├── http-client.test.ts
│   ├── cms-api/client/       # CMS API integration tests
│   ├── index-api/client/     # Index API integration tests
│   └── fixtures/             # Shared test context, constants, helpers
├── scripts/                  # Build scripts for extension packaging
│   └── template/             # Extension template assets (manifest, icon)
├── docs/
│   ├── openapi-cms.json      # CMS API OpenAPI spec
│   └── openapi-index.json    # Index API OpenAPI spec
├── .claude/                  # Claude Code configuration and rules
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## Architecture

### API Clients

- **ApiClient** (`src/http-client.ts`): Base HTTP client with Basic Auth, supporting GET/POST/PATCH/DELETE and FormData uploads
- **CMS Client** (`src/cms-api/client.ts`): Typed methods for objects, branches, comments, files, jobs, and code generation
- **Index Client** (`src/index-api/client.ts`): Search, count, occurrences, suggestions, and comment search

### Tool Modules

All MCP tools are registered in two modules:

- **CMS Tools** (`src/cms-api/tools.ts`): Object CRUD, branches, comments, files, jobs, code generation
- **Index Tools** (`src/index-api/tools.ts`): Object search/count/occurrences, suggestions, comment search/count, work items

## Dependencies

- `@modelcontextprotocol/sdk` — MCP protocol implementation
- `typescript` — TypeScript compiler
- `tsx` — TypeScript executor for development
- `vitest` — Testing framework
- `@types/node` — Node.js type definitions
