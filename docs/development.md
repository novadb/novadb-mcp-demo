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

- **`src/index.ts`** — Entry point. Creates the server, initializes API clients, registers tools, connects via `StdioServerTransport`.
- **`src/http-client.ts`** — Shared `ApiClient` with Basic Auth, JSON serialization, and support for GET/POST/PATCH/DELETE/multipart.
- **`src/cms/`** — CMS API module: `client.ts` (typed API client) + `tools.ts` (34 tool definitions via Zod schemas)
- **`src/index-api/`** — Index API module: `client.ts` (typed API client) + `tools.ts` (10 tool definitions)

Each module exports a `register*Tools(server, client)` function that registers tools via `server.tool()`.

## npx Distribution

`package.json` exposes `"bin": { "novadb-mcp": "dist/index.js" }` and runs `tsc` on `prepare`, so `npx -y git+ssh://...` clones, installs, compiles, and runs in one step.

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
