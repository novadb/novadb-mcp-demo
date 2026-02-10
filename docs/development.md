# Development & Architecture

## Prerequisites

- Node.js >= 18
- npm

## Getting Started

```bash
npm install   # Install dependencies
npm start     # Run server from TypeScript source (via tsx)
npm run build # Compile to dist/
```

## Server Architecture

The MCP server is built on the [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) and communicates via stdio.

### Entry Point

`src/index.ts` — Creates the MCP server, initializes two API clients (CMS + Index), registers all tools, and connects via `StdioServerTransport`.

### HTTP Client

`src/http-client.ts` — Shared `ApiClient` class used by both API modules. Handles Basic Auth, JSON serialization, and error propagation. Supports GET, POST, PATCH, DELETE, and multipart form uploads.

### CMS Module (`src/cms/`)

- `client.ts` — Typed API client wrapping CMS endpoints (objects, branches, comments, jobs, files)
- `tools.ts` — 34 MCP tool definitions using Zod schemas. Covers object CRUD, branch management, comment operations, job lifecycle, and file upload/download.

### Index Module (`src/index-api/`)

- `client.ts` — Typed API client wrapping Index API endpoints (search, count, facets, suggestions)
- `tools.ts` — 10 MCP tool definitions for full-text search, object/comment counting, faceted navigation, type-ahead suggestions, and XML link analysis.

## How Tools Are Registered

Each module exports a `register*Tools(server, client)` function that calls `server.tool()` with:

1. A tool name (e.g., `novadb_cms_get_object`)
2. A Zod schema describing the tool's parameters
3. An async handler that calls the API client and returns the result

Example pattern from `src/cms/tools.ts`:

```typescript
server.tool("novadb_cms_get_object", { branch: z.string(), id: z.string(), ... }, async (params) => {
  const result = await client.getObject(params.branch, params.id, ...);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});
```

## npx Distribution

The `package.json` is configured for `npx` usage:

- `"bin": { "novadb-mcp": "dist/index.js" }` — Exposes the server as an executable
- `"files": ["dist"]` — Only ships compiled output
- `"prepare": "tsc"` — Automatically compiles TypeScript on `npm install` (including when installed via `npx`)

This allows `npx -y git+ssh://...` to clone, install, compile, and run in one step.

## Project Structure

```
src/
  index.ts                 # Server entry point
  http-client.ts           # Shared HTTP client (Basic Auth)
  cms/
    client.ts              # CMS API client
    tools.ts               # 34 CMS tool definitions
  index-api/
    client.ts              # Index API client
    tools.ts               # 10 Index tool definitions
skills/                    # Claude Code skill definitions
agents/                    # Claude Code agent definitions
.github/skills/            # Copilot Agent Mode skills
docs/                      # Documentation
```
