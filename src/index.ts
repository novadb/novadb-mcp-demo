#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ApiClient } from "./http-client.js";
import { createIndexClient } from "./index-api/client.js";
import { registerIndexTools } from "./index-api/tools.js";
import { createCmsClient } from "./cms-api/client.js";
import { registerCmsTools } from "./cms-api/tools.js";
const server = new McpServer({
  name: "novadb",
  version: "3.0.0",
});

function resolveHost(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, "");
  try {
    return new URL(trimmed).hostname;
  } catch {
    return trimmed;
  }
}

const host = resolveHost(process.env.NOVA_HOST ?? "");

const indexApi = new ApiClient({
  baseUrl: `https://${host}/apis/index/v1`,
  user: process.env.NOVA_INDEX_USER ?? "",
  password: process.env.NOVA_INDEX_PASSWORD ?? "",
});

const cmsApi = new ApiClient({
  baseUrl: `https://${host}/apis/cms/v1`,
  user: process.env.NOVA_CMS_USER ?? "",
  password: process.env.NOVA_CMS_PASSWORD ?? "",
});

const indexClient = createIndexClient(indexApi);
const cmsClient = createCmsClient(cmsApi);
registerIndexTools(server, indexClient);
registerCmsTools(server, cmsClient);

const transport = new StdioServerTransport();
await server.connect(transport);
