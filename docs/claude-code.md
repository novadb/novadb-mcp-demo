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

### Directly in the config

```json
{
  "mcpServers": {
    "novadb": {
      "type": "stdio",
      "command": "/absolute/path/to/novadb-mcp-demo/node_modules/.bin/tsx",
      "args": ["/absolute/path/to/novadb-mcp-demo/src/index.ts"],
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

### From shell environment

Load the variables into your shell before starting Claude Code, then use `${...}` references in the config:

```bash
set -a && source .env-<username> && set +a
claude
```

```json
{
  "mcpServers": {
    "novadb": {
      "type": "stdio",
      "command": "/absolute/path/to/novadb-mcp-demo/node_modules/.bin/tsx",
      "args": ["/absolute/path/to/novadb-mcp-demo/src/index.ts"],
      "env": {
        "NOVA_HOST": "${NOVA_HOST}",
        "NOVA_INDEX_USER": "${NOVA_INDEX_USER}",
        "NOVA_INDEX_PASSWORD": "${NOVA_INDEX_PASSWORD}",
        "NOVA_CMS_USER": "${NOVA_CMS_USER}",
        "NOVA_CMS_PASSWORD": "${NOVA_CMS_PASSWORD}"
      }
    }
  }
}
```

> Replace `/absolute/path/to/novadb-mcp-demo` with the actual clone path.

## Plugin Components

### CLAUDE.md — AI Instructions

`CLAUDE.md` in the project root is automatically loaded by Claude Code. It contains:

- Session-start behavior (branch selection prompt)
- NovaDB data model reference (object hierarchy, ID ranges, value tuples)
- API overview with usage rules (when to use Index vs. CMS API)
- Common mistakes to avoid

This file is the authoritative reference for the NovaDB data model — it is not duplicated elsewhere.

### Skills

Skills are guided workflows invoked with `/skill-name` in Claude Code. Each skill lives in `skills/<name>/SKILL.md` and contains a self-contained prompt.

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

### Agents

Agents are specialized sub-agents that Claude Code can delegate to for focused tasks. Defined in `agents/`:

| Agent | File | Purpose |
|-------|------|---------|
| `explore-novadb` | `agents/explore-novadb.md` | Deep exploration of NovaDB data |
| `nova-forms` | `agents/nova-forms.md` | Form creation and editing |
| `nova-search` | `agents/nova-search.md` | Object search via Index API |
| `nova-list-branches` | `agents/nova-list-branches.md` | Branch listing and resolution |

### .mcp.json

The project-level `.mcp.json` configures the MCP server for local development with environment variable references. Claude Code reads this automatically when working inside the repo.
