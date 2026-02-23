1# NovaDB MCP Server

An MCP (Model Context Protocol) server for NovaDB CMS and Index APIs, enabling AI assistants to interact with NovaDB content management and data indexing systems.

## Overview

This server provides a comprehensive interface to NovaDB's core features through the Model Context Protocol. It exposes tools for managing content, object types, attributes, forms, and indexed data.

## Features

- **CMS API Integration**: Direct access to NovaDB CMS operations
- **Index API Integration**: Full-featured data indexing and retrieval
- **Object Type Management**: Create, update, and manage custom object types
- **Form Builder**: Design and configure forms for content management
- **Attribute System**: Manage attributes with validation and type checking
- **Branch Management**: Handle branching strategies for content versioning

## Installation

```bash
npm install
```

## Configuration

Set the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NOVA_HOST` | Base URL for NovaDB instance | Yes |
| `NOVA_INDEX_USER` | Username for Index API authentication | Yes |
| `NOVA_INDEX_PASSWORD` | Password for Index API authentication | Yes |
| `NOVA_CMS_USER` | Username for CMS API authentication | Yes |
| `NOVA_CMS_PASSWORD` | Password for CMS API authentication | Yes |

### Example

```bash
export NOVA_HOST="https://novadb.example.com"
export NOVA_INDEX_USER="index_user"
export NOVA_INDEX_PASSWORD="index_password"
export NOVA_CMS_USER="cms_user"
export NOVA_CMS_PASSWORD="cms_password"
```

## Development

### Build

```bash
npm run build
```

Compiles TypeScript source files from `src/` to `dist/` directory.

### Start

```bash
npm start
```

Runs the server with hot-reload using tsx.

### Watch Mode

```bash
npm run build -- --watch
```

or use VSCode: <kbd>Ctrl+Shift+P</kbd> → "Run Task" → "watch"

## Architecture

### API Clients

- **HttpClient** (`src/http-client.ts`): Base HTTP client with authentication
- **IndexApiClient** (`src/index-api/client.ts`): NovaDB Index API wrapper
- **CmsClient** (`src/cms/client.ts`): NovaDB CMS API wrapper

### Tool Modules

- **Index API Tools** (`src/index-api/tools.ts`): Core indexing and retrieval operations
- **CMS Tools** (`src/cms/tools.ts`): Content management operations
- **Object Types** (`src/extensions/object-types/`): Type system management
- **Forms** (`src/extensions/forms/`): Form configuration and management
- **Attributes** (`src/extensions/attributes/`): Attribute definition and validation
- **Branches** (`src/extensions/branches/`): Content branching support

## Debugging

### VSCode Integration

#### Debug Directly from TypeScript

1. Press <kbd>F5</kbd> or <kbd>Ctrl+Shift+D</kbd>
2. Select "Debug (ts-node)" configuration
3. Set breakpoints and debug directly in TypeScript source

#### Debug Compiled JavaScript

1. Press <kbd>F5</kbd>
2. Select "Debug (compiled)" configuration
3. Automatically builds before debugging

## Project Structure

```
novadb-mcp/
├── src/
│   ├── index.ts                 # Entry point
│   ├── http-client.ts           # Base HTTP client
│   ├── index-api/               # Index API integration
│   ├── cms/                     # CMS API integration
│   └── extensions/              # Extended features
│       ├── object-types/        # Object type management
│       ├── forms/               # Form management
│       ├── attributes/          # Attribute management
│       └── branches/            # Branch management
├── dist/                        # Compiled output
├── .vscode/                     # VSCode configuration
│   ├── tasks.json              # Build and watch tasks
│   └── launch.json             # Debug configurations
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Available Tools

### Index API
- Core indexing and retrieval operations for NovaDB data

### CMS API
- Content creation, retrieval, and management operations

### Object Types
- `create-object-type`: Define new object types
- `update-object-type`: Modify existing types
- `get-object-type`: Retrieve type definitions
- `add-attribute-to-type`: Add attributes to types

### Attributes
- `create-attribute`: Define new attributes
- `update-attribute`: Modify attributes
- `get-attribute`: Retrieve attribute definitions
- `search-attributes`: Find attributes by criteria
- `delete-attribute`: Remove attributes
- `set-validation-code`: Configure validation rules

### Forms
- `create-form`: Create form templates
- `get-form`: Retrieve form definitions
- `set-form-fields`: Configure form fields
- `add-form-field`: Add fields to forms
- `link-form-to-type`: Associate forms with object types

### Branches
- `list-branches`: List all branches
- `find-branches`: Search for branches
- `create-branch`: Create new branches
- `update-branch`: Modify branch configuration

## Build and Deploy

### Production Build

```bash
npm run build
```

Output will be in the `dist/` directory.

### Installation as Global Command

```bash
npm install -g ./
```

Then run:

```bash
novadb-mcp
```

## Dependencies

- `@modelcontextprotocol/sdk`: ^1.12.1
- `typescript`: ^5.7.0

## Development Dependencies

- `tsx`: ^4.19.0 (TypeScript executor for development)
- `@types/node`: ^22.0.0

## License

See LICENSE file for details.

## Support

For issues, questions, or contributions, please refer to the project repository.
