# VS Code / GitHub Copilot Setup

This repo includes configuration files for using the NovaDB MCP server with VS Code and GitHub Copilot.

## Prerequisites

- VS Code with GitHub Copilot extension
- Node.js >= 18
- Clone of this repository

## Setup

### 1. Clone and install dependencies

```bash
git clone git@ssh.dev.azure.com:v3/noxum/Noxum.Nova.Custom/novadb-mcp-demo
cd novadb-mcp-demo
npm install
```

> Kein Build nötig — die `.vscode/mcp.json` nutzt `npx tsx`, um TypeScript direkt auszuführen.

### 2. Create a `.env` file

Create a `.env` file in the project root (gitignored):

```env
NOVA_HOST=https://your-nova-instance.example.com
NOVA_INDEX_USER=your-index-user
NOVA_INDEX_PASSWORD=your-index-password
NOVA_CMS_USER=your-cms-user
NOVA_CMS_PASSWORD=your-cms-password
```

### 3. Open in VS Code

The MCP server starts automatically — VS Code reads `.vscode/mcp.json` and loads credentials from your `.env` file.

## Configuration Files

### `.vscode/mcp.json` — MCP Server

Two server configurations are provided:

```json
{
  "servers": {
    "novadb": {
      "type": "stdio",
      "command": "npx",
      "args": ["tsx", "src/index.ts"],
      "envFile": "${workspaceFolder}/.env"
    },
    "novadb-from-github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "https://github.com/novadb/novadb-mcp-demo"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

- **`novadb`** — Runs from local source via `tsx` (recommended for development)
- **`novadb-from-github`** — Runs via `npx` from a remote package (no local clone needed, but still requires `.env`)

### `.github/copilot-instructions.md` — AI Instructions

Equivalent to `CLAUDE.md` but for GitHub Copilot. Contains the NovaDB data model reference, API usage rules, and session-start behavior. Copilot loads this automatically when working in the repo.

### `.github/skills/` — Copilot Agent Mode Skills

Skills for GitHub Copilot's Agent Mode, mirroring the Claude Code skills in `skills/`. Each skill is a `SKILL.md` file in its own directory:

```
.github/skills/
  nova-explore/SKILL.md
  nova-search/SKILL.md
  nova-list-branches/SKILL.md
  nova-create-type/SKILL.md
  nova-forms/SKILL.md
  nova-import-data/SKILL.md
  nova-branches/SKILL.md
  nova-comments/SKILL.md
```

### `.vscode/settings.json` — Skill Locations

Tells VS Code where to find Copilot Agent Mode skills:

```json
{
  "chat.agentSkillsLocations": [
    ".vscode/skills"
  ]
}
```
