#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ApiClient } from "./http-client.js";
import { createIndexClient } from "./index-api/client.js";
import { registerIndexTools } from "./index-api/tools.js";
import { createCmsClient } from "./cms/client.js";
import { registerCmsTools } from "./cms/tools.js";

const server = new McpServer({
  name: "novadb",
  version: "3.0.0",
});

const host = process.env.NOVA_HOST ?? "";

const indexApi = new ApiClient({
  baseUrl: `${host}/apis/index/v1`,
  user: process.env.NOVA_INDEX_USER ?? "",
  password: process.env.NOVA_INDEX_PASSWORD ?? "",
});

const cmsApi = new ApiClient({
  baseUrl: `${host}/apis/cms/v0`,
  user: process.env.NOVA_CMS_USER ?? "",
  password: process.env.NOVA_CMS_PASSWORD ?? "",
});

registerIndexTools(server, createIndexClient(indexApi));
registerCmsTools(server, createCmsClient(cmsApi));

const transport = new StdioServerTransport();
await server.connect(transport);
