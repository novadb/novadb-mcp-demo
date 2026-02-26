# NovaDB MCP Server

> **IMPORTANT: Always think and write in English — regardless of the language the user uses to ask questions or give instructions. All responses, comments, code, and documentation must be in English.**

MCP server that exposes NovaDB CMS and Index APIs as tools for AI assistants.

## Quick Reference

```bash
npm run build          # Compile TypeScript → dist/
npm run start          # Run the MCP server (stdio transport)
npm test               # Run all tests (vitest)
npm run test:watch     # Watch mode
```

## Documentation

Detailed documentation lives in `docs/`:

- **[Architecture](../docs/architecture.md)** — Project structure, key types, environment variables, dependencies
- **[API Conventions](../docs/api-conventions.md)** — Response formats, multi-value ObjRef, language-dependent values, debugging
- **[Constants Reference](../docs/constants-reference.md)** — All attribute IDs, typeRef constants, data type enum
- **[Testing Guide](../docs/testing.md)** — Framework, fixtures, test file structure
- **[Tool Development](../docs/tool-development.md)** — How to add new MCP tools
