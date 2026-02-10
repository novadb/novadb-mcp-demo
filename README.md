# NovaDB MCP Demo

Demo repository showcasing three ways to connect AI assistants to a [NovaDB](https://www.noxum.com) instance via MCP (Model Context Protocol): as a **Claude Code plugin**, as a **VS Code / GitHub Copilot** integration, or as a **standalone MCP server** for any compatible client.

## What's Inside

### MCP Server (`src/`)

A TypeScript MCP server exposing 44 tools (34 CMS + 10 Index API) for full-text search, structured filtering, CRUD operations, job management, comments, and file handling against a NovaDB instance.

### Claude Code Plugin

Pre-configured for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with AI instructions (`CLAUDE.md`), 8 skills for guided workflows, and 4 specialized agents. Drop into any project or run via `npx`.

> [Setup guide](docs/claude-code.md)

### VS Code / GitHub Copilot

MCP server configs for VS Code (`.vscode/mcp.json`), Copilot instructions (`.github/copilot-instructions.md`), and Copilot Agent Mode skills (`.github/skills/`).

> [Setup guide](docs/vscode-copilot.md)

## Quick Start

### Claude Code

**Option A — npx (no clone needed):**

Add to your MCP config (`~/.claude/mcp.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "novadb": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "git+ssh://ssh.dev.azure.com/v3/noxum/Noxum.Nova.Custom/novadb-mcp-demo"],
      "env": {
        "NOVA_HOST": "https://your-nova-instance.example.com",
        "NOVA_INDEX_USER": "your-index-user",
        "NOVA_INDEX_PASSWORD": "your-index-password",
        "NOVA_CMS_USER": "your-cms-user",
        "NOVA_CMS_PASSWORD": "your-cms-password"
      }
    }
  }
}
```

**Option B — local clone:**

```bash
git clone git@ssh.dev.azure.com:v3/noxum/Noxum.Nova.Custom/novadb-mcp-demo
cd novadb-mcp-demo
npm install
```

See [Claude Code setup](docs/claude-code.md) for credential options and details.

### VS Code / GitHub Copilot

Clone the repo, create a `.env` file with your credentials, and open in VS Code. The MCP server starts automatically via `.vscode/mcp.json`.

See [VS Code / Copilot setup](docs/vscode-copilot.md) for details.

### Standalone MCP Client

```bash
git clone git@ssh.dev.azure.com:v3/noxum/Noxum.Nova.Custom/novadb-mcp-demo
cd novadb-mcp-demo
npm install && npm run build
```

Point your MCP client at `dist/index.js` (or use `npx novadb-mcp` after build). Pass credentials as environment variables.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NOVA_HOST` | Base URL of the NovaDB instance |
| `NOVA_INDEX_USER` | User for the Index API |
| `NOVA_INDEX_PASSWORD` | Password for the Index API |
| `NOVA_CMS_USER` | User for the CMS API |
| `NOVA_CMS_PASSWORD` | Password for the CMS API |

## Skills

Skills are guided workflows that AI assistants can invoke. Available in Claude Code (via `skills/`) and Copilot Agent Mode (via `.github/skills/`).

| Skill | Description |
|-------|-------------|
| `/nova-explore` | Browse, query, filter, and search Nova data |
| `/nova-search` | Find objects by text, attributes, or type |
| `/nova-list-branches` | List available branches with resolved references |
| `/nova-create-type` | Create object types, attribute definitions, and forms |
| `/nova-forms` | Create and edit forms (UI layout definitions) |
| `/nova-import-data` | Import and create data objects |
| `/nova-branches` | Create, update, delete, and inspect branches |
| `/nova-comments` | Manage comments on objects |

## Project Structure

```
src/                         # MCP Server (TypeScript)
  index.ts                   #   Server entry point
  http-client.ts             #   Shared HTTP client (Basic Auth)
  cms/                       #   CMS API — 34 tools
    client.ts                #     API client
    tools.ts                 #     Tool definitions (Zod schemas)
  index-api/                 #   Index API — 10 tools
    client.ts                #     API client
    tools.ts                 #     Tool definitions (Zod schemas)

CLAUDE.md                    # Claude Code: AI instructions & data model reference
.mcp.json                    # Claude Code: MCP server config
.claude-plugin/              # Claude Code: Plugin manifest
skills/                      # Claude Code: 8 skill definitions (SKILL.md each)
agents/                      # Claude Code: 4 specialized agents

.github/copilot-instructions.md  # VS Code Copilot: AI instructions
.github/skills/                  # VS Code Copilot: Agent Mode skills
.vscode/mcp.json                 # VS Code: MCP server configs
.vscode/settings.json            # VS Code: Copilot skill locations

docs/                        # Documentation
  claude-code.md             #   Claude Code plugin setup
  vscode-copilot.md          #   VS Code / Copilot setup
  development.md             #   Server architecture & development
```

## Documentation

- [Claude Code Plugin Setup](docs/claude-code.md)
- [VS Code / GitHub Copilot Setup](docs/vscode-copilot.md)
- [Development & Architecture](docs/development.md)
