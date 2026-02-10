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

No build needed — `.vscode/mcp.json` uses `npx tsx` to run TypeScript directly.

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

## Alternative: Run from GitHub without cloning

Add this to `.vscode/mcp.json` (or your user-level MCP config):

```json
{
  "servers": {
    "novadb-from-github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "https://github.com/novadb/novadb-mcp-demo"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

A `.env` file with credentials is still required. Copilot Agent Mode skills from `.github/skills/` won't be available since the repo isn't cloned locally. To use them, copy the skills directory to `~/.vscode/skills/` and add `"chat.agentSkillsLocations": ["~/.vscode/skills"]` to your VS Code user settings.
