# Claude Code Plugin Setup

This repo is a ready-to-use [Claude Code plugin](https://docs.anthropic.com/en/docs/claude-code). It provides an MCP server, AI instructions, skills, and agents — all pre-wired so Claude Code can work with NovaDB out of the box.

## Installation

### Option A: npx (no clone needed)

Add to your MCP config (`~/.claude/mcp.json` for global, or `.mcp.json` in any project):

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

The first invocation clones the repo, installs dependencies, and compiles TypeScript. Subsequent runs use the cached version.

### Option B: Local clone

```bash
git clone git@ssh.dev.azure.com:v3/noxum/Noxum.Nova.Custom/novadb-mcp-demo
cd novadb-mcp-demo
npm install
```

## Credentials

Pass credentials directly in the `env` block (as shown above), or load them from your shell environment before starting Claude Code (`set -a && source .env && set +a && claude`) and use `${NOVA_HOST}` references in the config.

## Plugin Components

- **`CLAUDE.md`** — AI instructions loaded automatically by Claude Code (data model, API rules, session behavior)
- **`skills/`** — 8 guided workflows, invoked with `/nova-explore`, `/nova-search`, etc.
- **`agents/`** — 4 specialized sub-agents: `explore-novadb`, `nova-forms`, `nova-search`, `nova-list-branches`
- **`.mcp.json`** — MCP server config for local development (read automatically inside the repo)
