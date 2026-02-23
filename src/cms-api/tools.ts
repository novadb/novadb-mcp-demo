import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CmsClient } from "./client.js";

const cmsValueSchema = z.object({
  attribute: z.number().describe("Attribute definition ID"),
  variant: z.number().default(0).describe("Variant ID (0 if not variant-specific)"),
  language: z.number().default(0).describe("Language ID (0 if not language-specific)"),
  value: z.unknown().optional().describe("Property value (string, number, or boolean)"),
  sortReverse: z.number().nullable().optional().describe("Ordering index for multi-value attributes (0, 1, 2…). Each value needs its own CmsValue entry."),
  unitRef: z.number().nullable().optional().describe("Unit of measure reference ID"),
});

const cmsObjectMetaSchema = z.object({
  id: z.number().optional().describe("Object ID (omit for new objects)"),
  guid: z.string().optional().describe("Object GUID"),
  apiIdentifier: z.string().nullable().optional().describe("API identifier"),
  typeRef: z.number().describe("Object type ID (required)"),
  lastTransaction: z.number().optional().describe("Last transaction ID"),
  deleted: z.boolean().optional().describe("Deleted flag"),
});

const cmsObjectSchema = z.object({
  meta: cmsObjectMetaSchema,
  values: z.array(cmsValueSchema).optional().describe("Property values as attribute/variant/language/value tuples"),
});

export function registerCmsTools(server: McpServer, client: CmsClient) {
  // --- Read tools ---

  server.tool(
    "novadb_cms_get_object",
    "Fetch a single CMS object by ID. Returns meta (id, typeRef, apiIdentifier) and values as attribute/language/variant tuples.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      id: z.string().describe("Object ID, GUID, or ApiIdentifier"),
      inherited: z.boolean().optional().describe("Include inherited values (default: false)"),
      attributes: z.string().optional().describe("Comma-separated attribute IDs/GUIDs/ApiIdentifiers to filter"),
      variants: z.string().optional().describe("Comma-separated variant IDs/GUIDs/ApiIdentifiers to filter"),
      languages: z.string().optional().describe("Comma-separated language IDs/GUIDs/ApiIdentifiers to filter"),
    },
    async ({ branch, id, ...rest }) => {
      const result = await client.getObject(branch, id, rest);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_objects",
    "Fetch multiple CMS objects by IDs in one call. Returns { objects: CmsObject[] }.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      ids: z.string().describe("Comma-separated object IDs, GUIDs, or ApiIdentifiers"),
      inherited: z.boolean().optional().describe("Include inherited values (default: false)"),
      attributes: z.string().optional().describe("Comma-separated attribute IDs to filter"),
      variants: z.string().optional().describe("Comma-separated variant IDs to filter"),
      languages: z.string().optional().describe("Comma-separated language IDs to filter"),
    },
    async ({ branch, ids, ...rest }) => {
      const result = await client.getObjects(branch, ids, rest);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_typed_objects",
    "List objects of a specific type with pagination (default: 5 results). Use 'continue' token for next page. Limit meta-types (typeRef=0) with 'attributes' and small 'take'.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      type: z.string().describe("Object type ID, GUID, or ApiIdentifier"),
      deleted: z.boolean().optional().describe("Filter by deleted status"),
      inherited: z.boolean().optional().describe("Include inherited values (default: false)"),
      continue: z.string().optional().describe("Opaque continuation token from previous response's 'continue' field. Omit for first page."),
      take: z.number().optional().describe("Page size (default: 5). Response includes 'continue' token when more pages exist."),
      attributes: z.string().optional().describe("Comma-separated attribute IDs to filter"),
      variants: z.string().optional().describe("Comma-separated variant IDs to filter"),
      languages: z.string().optional().describe("Comma-separated language IDs to filter"),
    },
    async ({ branch, type, ...rest }) => {
      const result = await client.getTypedObjects(branch, type, rest);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Write tools ---

  server.tool(
    "novadb_cms_create_objects",
    "Create one or more objects. Each needs meta.typeRef and values[]. For multi-value ObjRef attributes, send separate CmsValue entries with sortReverse 0, 1, 2... (not arrays). Returns { createdObjectIds: number[] } — use get_object to fetch full data after creation.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      objects: z.array(cmsObjectSchema).describe("Objects to create"),
      comment: z.string().optional().describe("Audit trail comment"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ branch, objects, comment, username }) => {
      const result = await client.createObjects(branch, objects, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_update_objects",
    "Update one or more objects. Each needs meta.id (or meta.guid) and values[] to set. Returns { updatedObjects: number, createdValues: number }. Only provided values are changed, but for multi-value attributes send the COMPLETE set (omitted entries are deleted).",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      objects: z.array(cmsObjectSchema).describe("Objects to update (must include meta.id or meta.guid)"),
      comment: z.string().optional().describe("Audit trail comment"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ branch, objects, comment, username }) => {
      const result = await client.updateObjects(branch, objects, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_delete_objects",
    "Soft-delete objects by IDs. Returns { deletedObjects: number }.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      objectIds: z.array(z.string()).describe("Object IDs, GUIDs, or ApiIdentifiers to delete"),
      comment: z.string().optional().describe("Audit trail comment"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ branch, objectIds, comment, username }) => {
      const result = await client.deleteObjects(branch, objectIds, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Branch tools ---

  server.tool(
    "novadb_cms_get_branch",
    "Fetch a single branch by ID. Returns a raw CmsObject with meta and values. Use attribute IDs 1000 (name), 4000-4004 (branch properties) to interpret values.",
    {
      id: z.string().describe("Branch ID or 'draft'"),
      attributes: z.string().optional().describe("Comma-separated attribute IDs/GUIDs/ApiIdentifiers to filter"),
      variants: z.string().optional().describe("Comma-separated variant IDs/GUIDs/ApiIdentifiers to filter"),
      languages: z.string().optional().describe("Comma-separated language IDs/GUIDs/ApiIdentifiers to filter"),
    },
    async ({ id, ...rest }) => {
      const result = await client.getBranch(id, rest);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_create_branch",
    "Create a new branch with CmsValue[] for attributes 1000 (name, language-dependent), 4000 (parent), 4001 (type), 4002 (state), 4003 (due date), 4004 (assigned to). Required: attr 1000 (name, needs separate entries per language: 201=en, 202=de), 4000 (parent branch ID). Returns { createdObjectIds }.",
    {
      values: z.array(cmsValueSchema).describe("Branch property values as attribute/variant/language/value tuples"),
      comment: z.string().optional().describe("Audit trail comment"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ values, comment, username }) => {
      const result = await client.createBranch(values, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_update_branch",
    "Update branch properties via CmsValue[]. Only provided values are changed. Uses same attribute IDs as create: 1000, 4000-4004. Returns { updatedObjects }.",
    {
      id: z.string().describe("Branch ID or 'draft'"),
      values: z.array(cmsValueSchema).describe("Branch property values to update"),
      comment: z.string().optional().describe("Audit trail comment"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ id, values, comment, username }) => {
      const result = await client.updateBranch(id, values, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_delete_branch",
    "Permanently delete a branch (cannot be undone). Returns { deletedObjects }.",
    {
      id: z.string().describe("Branch ID or 'draft'"),
      comment: z.string().optional().describe("Audit trail comment"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ id, comment, username }) => {
      const result = await client.deleteBranch(id, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Comment tools ---

  server.tool(
    "novadb_cms_get_comments",
    "List comments with optional filters (branch, object, user, deleted status). Paginated via 'continue' token.",
    {
      branchRef: z.number().optional().describe("Filter by branch ID"),
      objectRef: z.number().optional().describe("Filter by object ID"),
      user: z.string().optional().describe("Filter by comment author"),
      isDeleted: z.boolean().optional().describe("Filter by deleted status"),
      continue: z.string().optional().describe("Opaque continuation token from previous response's 'continue' field. Omit for first page."),
      take: z.number().optional().describe("Page size (default: 5). Response includes 'continue' token when more pages exist."),
    },
    async (params) => {
      const result = await client.getComments(params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_comment",
    "Fetch a single comment by ID.",
    {
      commentId: z.string().describe("Comment ID"),
    },
    async ({ commentId }) => {
      const result = await client.getComment(commentId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_create_comment",
    "Create a comment on an object. Body must be XHTML with <div> root, e.g. '<div>My comment</div>'. Returns { id }.",
    {
      branchId: z.number().describe("Branch ID"),
      objectRef: z.number().describe("Object ID to comment on"),
      body: z.string().describe("Comment body as XHTML with <div> root, e.g. '<div>My comment</div>'"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ branchId, objectRef, body, username }) => {
      const result = await client.createComment(branchId, objectRef, body, { username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_update_comment",
    "Update a comment's body. Body must be XHTML with <div> root. Returns 204 No Content.",
    {
      commentId: z.string().describe("Comment ID"),
      body: z.string().describe("New comment body as XHTML with <div> root"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ commentId, body, username }) => {
      const result = await client.updateComment(commentId, body, { username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_delete_comment",
    "Delete a comment by ID. Returns 204 No Content.",
    {
      commentId: z.string().describe("Comment ID"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ commentId, username }) => {
      const result = await client.deleteComment(commentId, { username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Code Generator tools ---

  server.tool(
    "novadb_cms_get_code_generator_types",
    "Generate C# code for types in a branch. Only 'csharp' is supported as language.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      language: z.string().describe("Programming language. Only 'csharp' is supported."),
      ids: z.string().optional().describe("Comma-separated type IDs to filter"),
    },
    async ({ branch, language, ids }) => {
      const result = await client.getCodeGeneratorTypes(branch, language, { ids });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "novadb_cms_get_code_generator_type",
    "Generate C# code for a single type. Only 'csharp' is supported as language.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      language: z.string().describe("Programming language. Only 'csharp' is supported."),
      type: z.string().describe("Type ID, GUID, or ApiIdentifier"),
    },
    async ({ branch, language, type }) => {
      const result = await client.getCodeGeneratorType(branch, language, type);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // --- Job tools ---

  server.tool(
    "novadb_cms_get_jobs",
    "List server-side processing jobs for a branch. Returns { jobs[], continue } with state, definition, timestamps.",
    {
      branchId: z.number().describe("Branch ID"),
      definitionRef: z.number().optional().describe("Filter by job definition ID"),
      state: z.number().optional().describe("Filter by state: 0=New, 1=Running, 2=Succeeded, 3=Error, 4=KillRequested, 5=RestartRequested"),
      triggerRef: z.number().optional().describe("Filter by trigger ID"),
      createdBy: z.string().optional().describe("Filter by creator username"),
      isDeleted: z.boolean().optional().describe("Filter by deleted status"),
      continue: z.string().optional().describe("Opaque continuation token from previous response's 'continue' field. Omit for first page."),
      take: z.number().optional().describe("Page size (default: 5). Response includes 'continue' token when more pages exist."),
    },
    async ({ branchId, ...rest }) => {
      const result = await client.getJobs(branchId, rest);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_job",
    "Fetch a single job by ID. Returns id, state, definitionRef, branchId, progress, timestamps, parameters.",
    {
      jobId: z.string().describe("Job ID"),
    },
    async ({ jobId }) => {
      const result = await client.getJob(jobId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_job_logs",
    "Fetch execution logs for a job. Returns plain text.",
    {
      jobId: z.string().describe("Job ID"),
    },
    async ({ jobId }) => {
      const result = await client.getJobLogs(jobId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "novadb_cms_get_job_metrics",
    "Fetch runtime metrics for a job (CPU, memory, uptime). Returns time-series data points.",
    {
      jobId: z.string().describe("Job ID"),
      maxItems: z.number().optional().describe("Optional parameter to limit the number of metric points returned"),
    },
    async ({ jobId, maxItems }) => {
      const result = await client.getJobMetrics(jobId, { maxItems });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_job_progress",
    "Fetch current progress for a running job. Returns { processedCount, totalCount, percentage }.",
    {
      jobId: z.string().describe("Job ID"),
    },
    async ({ jobId }) => {
      const result = await client.getJobProgress(jobId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_create_job",
    "Create a server-side processing job (e.g. import, export, code generation). Returns { id, state }. Use get_job to poll status.",
    {
      branchId: z.number().describe("Branch ID"),
      jobDefinitionId: z.number().describe("Job definition ID"),
      scopeIds: z.array(z.number()).optional().describe("Scope object IDs"),
      objIds: z.array(z.number()).optional().describe("Object IDs to process"),
      parameters: z.array(z.object({
        name: z.string().describe("Parameter name"),
        values: z.array(z.string()).describe("Parameter values"),
      })).optional().describe("Job parameters"),
      inputFile: z.object({
        token: z.string().describe("Upload token from jobInput endpoint"),
        name: z.string().describe("Original filename"),
      }).optional().describe("Input file reference from prior upload"),
      language: z.number().optional().describe("Language ID for the job"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ branchId, jobDefinitionId, scopeIds, objIds, parameters, inputFile, language, username }) => {
      const result = await client.createJob({ branchId, jobDefinitionId, scopeIds, objIds, parameters, inputFile, language, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_update_job",
    "Update a job's state (4=KillRequest, 5=RestartRequest) or retention period.",
    {
      jobId: z.string().describe("Job ID"),
      retainUntil: z.string().optional().describe("ISO date-time until which to retain the job"),
      state: z.number().optional().describe("New state: 4=KillRequest, 5=RestartRequest"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ jobId, retainUntil, state, username }) => {
      const result = await client.updateJob(jobId, { retainUntil, state, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_delete_job",
    "Delete a job and its artifacts.",
    {
      jobId: z.string().describe("Job ID"),
      username: z.string().optional().describe("Acting username for audit"),
    },
    async ({ jobId, username }) => {
      const result = await client.deleteJob(jobId, { username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_job_object_ids",
    "Fetch the array of object IDs that were processed by a completed job.",
    {
      jobId: z.string().describe("Job ID"),
    },
    async ({ jobId }) => {
      const result = await client.getJobObjectIds(jobId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Job Artifact tools ---

  server.tool(
    "novadb_cms_get_job_artifacts",
    "List file artifacts produced by a completed job. Returns artifact paths and metadata.",
    {
      jobId: z.string().describe("Job ID"),
    },
    async ({ jobId }) => {
      const result = await client.getJobArtifacts(jobId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_job_artifact",
    "Download a specific job artifact by path. Returns file content as text.",
    {
      jobId: z.string().describe("Job ID"),
      path: z.string().describe("Artifact path"),
    },
    async ({ jobId, path }) => {
      const result = await client.getJobArtifact(jobId, path);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "novadb_cms_get_job_artifacts_zip",
    "Download all job artifacts as a ZIP (base64).",
    {
      jobId: z.string().describe("Job ID"),
    },
    async ({ jobId }) => {
      const result = await client.getJobArtifactsZip(jobId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // --- Job Input tools ---

  server.tool(
    "novadb_cms_job_input_upload",
    "Upload a job input file (base64-encoded). Returns { token } for use in create_job's inputFile parameter.",
    {
      fileBase64: z.string().describe("Base64-encoded file content"),
      filename: z.string().describe("Original filename"),
    },
    async ({ fileBase64, filename }) => {
      const buffer = Buffer.from(fileBase64, "base64");
      const result = await client.jobInputUpload(buffer, filename);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_job_input_continue",
    "Continue a chunked job input upload (base64-encoded). Use token from previous upload call.",
    {
      token: z.string().describe("Upload token from previous upload call"),
      fileBase64: z.string().describe("Base64-encoded file content"),
      filename: z.string().describe("Original filename"),
    },
    async ({ token, fileBase64, filename }) => {
      const buffer = Buffer.from(fileBase64, "base64");
      const result = await client.jobInputContinue(token, buffer, filename);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_job_input_cancel",
    "Cancel a job input upload.",
    {
      token: z.string().describe("Upload token to cancel"),
    },
    async ({ token }) => {
      const result = await client.jobInputCancel(token);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // ── File tools ──

  server.tool(
    "novadb_cms_get_file",
    "Download a file by name. Text files returned as-is, binary as base64-prefixed.",
    {
      name: z.string().describe("File name/identifier (GUID with extension, e.g. 'abc123.png')"),
    },
    async ({ name }) => {
      const result = await client.getFile(name);
      return {
        content: [
          {
            type: "text",
            text: result.type === "text" ? result.data : `[base64] ${result.data}`,
          },
        ],
      };
    }
  );

  server.tool(
    "novadb_cms_upload_file",
    "Start uploading a file (base64-encoded). Returns { token, fileIdentifier }. Set commit=true for single-chunk uploads.",
    {
      fileBase64: z.string().describe("Base64-encoded file content"),
      filename: z.string().describe("Original filename"),
      extension: z.string().describe("File extension without dot, e.g. 'jpg', 'pdf'"),
      commit: z.boolean().describe("Whether to commit the upload immediately (true for single-chunk uploads)"),
    },
    async ({ fileBase64, filename, extension, commit }) => {
      const buffer = Buffer.from(fileBase64, "base64");
      const result = await client.fileUploadStart(buffer, filename, extension, commit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "novadb_cms_upload_file_continue",
    "Continue a chunked file upload (base64-encoded). Set commit=true on the final chunk.",
    {
      fileBase64: z.string().describe("Base64-encoded file content chunk"),
      filename: z.string().describe("Original filename"),
      extension: z.string().describe("File extension (e.g. 'jpg', 'pdf')"),
      commit: z.boolean().describe("Whether to commit the upload (true for the final chunk)"),
      token: z.string().describe("Upload token from the start call"),
    },
    async ({ fileBase64, filename, extension, commit, token }) => {
      const buffer = Buffer.from(fileBase64, "base64");
      const result = await client.fileUploadContinue(buffer, filename, extension, commit, token);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "novadb_cms_upload_file_cancel",
    "Cancel a file upload and discard uploaded data.",
    {
      token: z.string().describe("Upload token to cancel"),
    },
    async ({ token }) => {
      const result = await client.fileUploadCancel(token);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

}
