# NovaDB MCP Demo

Demo repository showcasing three ways to connect AI assistants to a [NovaDB](https://www.noxum.com) instance via MCP (Model Context Protocol): as a **Claude Code plugin**, as a **VS Code / GitHub Copilot** integration, or as a **standalone MCP server** for any compatible client.

## What's Inside

- **MCP Server** (`src/`) — TypeScript server exposing 44 tools (34 CMS + 10 Index API) for NovaDB
- **Claude Code Plugin** — AI instructions, skills, and agents for Claude Code ([setup guide](docs/claude-code.md))
- **VS Code / GitHub Copilot** — MCP configs, Copilot instructions, and Agent Mode skills ([setup guide](docs/vscode-copilot.md))

## Quick Start

### Claude Code

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

Alternatively, clone the repo and run locally — see [Claude Code setup](docs/claude-code.md) for details.

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

8 guided workflows are available as skills — see `skills/` (Claude Code) and `.github/skills/` (Copilot). Invoke with `/nova-explore`, `/nova-search`, `/nova-create-type`, etc.

## Development

See [Development & Architecture](docs/development.md) for server internals and project structure.
