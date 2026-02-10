import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { CmsClient } from "./client.js";

const cmsValueSchema = z.object({
  attribute: z.number().describe("Attribute definition ID"),
  variant: z.number().default(0).describe("Variant ID (0 if not variant-specific)"),
  language: z.number().default(0).describe("Language ID (0 if not language-specific)"),
  value: z.unknown().optional().describe("Property value (string, number, or boolean)"),
  sortReverse: z.number().nullable().optional().describe("Reverse sort key"),
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
    "Fetch a single object by ID via the CMS API. Returns normalized values as attribute/language/variant tuples.",
    {
      branch: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
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
    "Fetch multiple objects by IDs via the CMS API. Returns normalized values.",
    {
      branch: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
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
    "List objects of a specific type via the CMS API. Supports cursor-based pagination. WARNING: Listing meta-types (e.g. type='root') can return very large responses. Use 'attributes' (e.g. '1000' for names only) and 'take' to limit response size.",
    {
      branch: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
      type: z.string().describe("Object type ID, GUID, or ApiIdentifier"),
      deleted: z.boolean().optional().describe("Filter by deleted status"),
      inherited: z.boolean().optional().describe("Include inherited values (default: false)"),
      continue: z.string().optional().describe("Opaque continuation token from previous response's 'continue' field. Omit for first page."),
      take: z.number().optional().describe("Page size (default: 20). Response includes 'continue' token when more pages exist."),
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
    "WRITE OPERATION: Create one or more objects on a branch. Each object needs meta.typeRef and a values array with attribute/language/variant/value tuples. Returns created object IDs.",
    {
      branch: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
      objects: z.array(cmsObjectSchema).describe("Objects to create"),
      comment: z.string().optional().describe("Transaction comment for audit trail"),
      username: z.string().optional().describe("Username to attribute this transaction to"),
    },
    async ({ branch, objects, comment, username }) => {
      const result = await client.createObjects(branch, objects, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_update_objects",
    "WRITE OPERATION: Update one or more objects on a branch. Each object must have meta.id or meta.guid to identify it, and a values array with the attribute values to set.",
    {
      branch: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
      objects: z.array(cmsObjectSchema).describe("Objects to update (must include meta.id or meta.guid)"),
      comment: z.string().optional().describe("Transaction comment for audit trail"),
      username: z.string().optional().describe("Username to attribute this transaction to"),
    },
    async ({ branch, objects, comment, username }) => {
      const result = await client.updateObjects(branch, objects, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_delete_objects",
    "WRITE OPERATION: Delete one or more objects from a branch. This marks objects as deleted.",
    {
      branch: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
      objectIds: z.array(z.string()).describe("Object IDs, GUIDs, or ApiIdentifiers to delete"),
      comment: z.string().optional().describe("Transaction comment for audit trail"),
      username: z.string().optional().describe("Username to attribute this transaction to"),
    },
    async ({ branch, objectIds, comment, username }) => {
      const result = await client.deleteObjects(branch, objectIds, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Branch tools ---

  server.tool(
    "novadb_cms_get_branch",
    "Fetch a single branch by ID via the CMS API. Returns the branch as a CmsObject with normalized value tuples.",
    {
      id: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
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
    "WRITE OPERATION: Create a new branch (work package). Provide values as attribute/language/variant tuples. Returns the created branch as a CmsObject.",
    {
      values: z.array(cmsValueSchema).describe("Branch property values as attribute/variant/language/value tuples"),
      comment: z.string().optional().describe("Transaction comment for audit trail"),
      username: z.string().optional().describe("Username to attribute this transaction to"),
    },
    async ({ values, comment, username }) => {
      const result = await client.createBranch(values, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_update_branch",
    "WRITE OPERATION: Update a branch (work package). Provide values as attribute/language/variant tuples to set.",
    {
      id: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
      values: z.array(cmsValueSchema).describe("Branch property values to update"),
      comment: z.string().optional().describe("Transaction comment for audit trail"),
      username: z.string().optional().describe("Username to attribute this transaction to"),
    },
    async ({ id, values, comment, username }) => {
      const result = await client.updateBranch(id, values, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_delete_branch",
    "WRITE OPERATION: Delete a branch (work package) permanently. This cannot be undone.",
    {
      id: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
      comment: z.string().optional().describe("Transaction comment for audit trail"),
      username: z.string().optional().describe("Username to attribute this transaction to"),
    },
    async ({ id, comment, username }) => {
      const result = await client.deleteBranch(id, { comment, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Comment tools ---

  server.tool(
    "novadb_cms_get_comments",
    "List comments, optionally filtered by branch, object, or user.",
    {
      branchRef: z.number().optional().describe("Filter by branch ID"),
      objectRef: z.number().optional().describe("Filter by object ID"),
      user: z.string().optional().describe("Filter by comment author"),
      isDeleted: z.boolean().optional().describe("Filter by deleted status"),
      continue: z.string().optional().describe("Opaque continuation token from previous response's 'continue' field. Omit for first page."),
      take: z.number().optional().describe("Page size (default: 20). Response includes 'continue' token when more pages exist."),
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
    "WRITE OPERATION: Create a new comment on an object.",
    {
      branchId: z.number().describe("Branch ID"),
      objectRef: z.number().describe("Object ID to comment on"),
      body: z.string().describe("Comment body text"),
      username: z.string().optional().describe("Username to attribute this action to"),
    },
    async ({ branchId, objectRef, body, username }) => {
      const result = await client.createComment(branchId, objectRef, body, { username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_update_comment",
    "WRITE OPERATION: Update an existing comment's body text.",
    {
      commentId: z.string().describe("Comment ID"),
      body: z.string().describe("New comment body text"),
      username: z.string().optional().describe("Username to attribute this action to"),
    },
    async ({ commentId, body, username }) => {
      const result = await client.updateComment(commentId, body, { username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_delete_comment",
    "WRITE OPERATION: Delete a comment by ID.",
    {
      commentId: z.string().describe("Comment ID"),
      username: z.string().optional().describe("Username to attribute this action to"),
    },
    async ({ commentId, username }) => {
      const result = await client.deleteComment(commentId, { username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- Code Generator tools ---

  server.tool(
    "novadb_cms_get_code_generator_types",
    "Get generated code for all types in a branch for a specific programming language.",
    {
      branch: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
      language: z.string().describe("Programming language (e.g. 'csharp', 'typescript')"),
      ids: z.string().optional().describe("Comma-separated type IDs to filter"),
    },
    async ({ branch, language, ids }) => {
      const result = await client.getCodeGeneratorTypes(branch, language, { ids });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "novadb_cms_get_code_generator_type",
    "Get generated code for a single type in a branch for a specific programming language.",
    {
      branch: z.string().describe("Branch ID, GUID, or ApiIdentifier"),
      language: z.string().describe("Programming language (e.g. 'csharp', 'typescript')"),
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
    "List jobs for a branch, optionally filtered by definition, state, or creator.",
    {
      branchId: z.number().describe("Branch ID"),
      definitionRef: z.number().optional().describe("Filter by job definition ID"),
      state: z.number().optional().describe("Filter by state: 0=New, 1=Running, 2=Succeeded, 3=Error, 4=KillRequest, 5=RestartRequest"),
      triggerRef: z.number().optional().describe("Filter by trigger ID"),
      createdBy: z.string().optional().describe("Filter by creator username"),
      isDeleted: z.boolean().optional().describe("Filter by deleted status"),
      continue: z.string().optional().describe("Opaque continuation token from previous response's 'continue' field. Omit for first page."),
      take: z.number().optional().describe("Page size (default: 20). Response includes 'continue' token when more pages exist."),
    },
    async ({ branchId, ...rest }) => {
      const result = await client.getJobs(branchId, rest);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_job",
    "Fetch a single job by ID, including its status, parameters, and timing info.",
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
    "Fetch execution logs for a job.",
    {
      jobId: z.string().describe("Job ID"),
    },
    async ({ jobId }) => {
      const result = await client.getJobLogs(jobId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "novadb_cms_create_job",
    "WRITE OPERATION: Create and start a new job on a branch.",
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
      username: z.string().optional().describe("Username to attribute this action to"),
    },
    async ({ branchId, jobDefinitionId, scopeIds, objIds, parameters, inputFile, language, username }) => {
      const result = await client.createJob({ branchId, jobDefinitionId, scopeIds, objIds, parameters, inputFile, language, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_update_job",
    "WRITE OPERATION: Update a job (e.g. change state to kill/restart, or set retainUntil).",
    {
      jobId: z.string().describe("Job ID"),
      retainUntil: z.string().optional().describe("ISO date-time until which to retain the job"),
      state: z.number().optional().describe("New state: 4=KillRequest, 5=RestartRequest"),
      username: z.string().optional().describe("Username to attribute this action to"),
    },
    async ({ jobId, retainUntil, state, username }) => {
      const result = await client.updateJob(jobId, { retainUntil, state, username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_delete_job",
    "WRITE OPERATION: Delete a job by ID.",
    {
      jobId: z.string().describe("Job ID"),
      username: z.string().optional().describe("Username to attribute this action to"),
    },
    async ({ jobId, username }) => {
      const result = await client.deleteJob(jobId, { username });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_job_object_ids",
    "Get the list of object IDs processed by a job.",
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
    "List artifacts produced by a job.",
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
    "Fetch the content of a specific job artifact by path.",
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
    "Download all job artifacts as a ZIP file (returned as base64).",
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
    "WRITE OPERATION: Upload an input file for a job. Returns an upload token. File content must be base64-encoded.",
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
    "WRITE OPERATION: Continue uploading an input file for a job (chunked upload). File content must be base64-encoded.",
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
    "WRITE OPERATION: Cancel a job input upload and discard the uploaded data.",
    {
      token: z.string().describe("Upload token to cancel"),
    },
    async ({ token }) => {
      const result = await client.jobInputCancel(token);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  // --- File tools ---

  server.tool(
    "novadb_cms_get_file",
    "Fetch a file by name. Returns text content directly or binary content as base64.",
    {
      name: z.string().describe("File name/identifier"),
    },
    async ({ name }) => {
      const result = await client.getFile(name);
      return { content: [{ type: "text", text: result.type === "text" ? result.data : `[base64] ${result.data}` }] };
    }
  );

  server.tool(
    "novadb_cms_file_upload_start",
    "WRITE OPERATION: Start uploading a file. File content must be base64-encoded. Returns upload token.",
    {
      fileBase64: z.string().describe("Base64-encoded file content"),
      filename: z.string().describe("Original filename"),
      extension: z.string().describe("File extension (e.g. 'jpg', 'pdf')"),
      commit: z.boolean().describe("Whether to commit the upload immediately (true for single-chunk uploads)"),
      token: z.string().optional().describe("Optional pre-allocated token"),
    },
    async ({ fileBase64, filename, extension, commit, token }) => {
      const buffer = Buffer.from(fileBase64, "base64");
      const result = await client.fileUploadStart(buffer, filename, extension, commit, token);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_file_upload_continue",
    "WRITE OPERATION: Continue a chunked file upload. File content must be base64-encoded.",
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
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_file_upload_cancel",
    "WRITE OPERATION: Cancel a file upload and discard uploaded data.",
    {
      token: z.string().describe("Upload token to cancel"),
    },
    async ({ token }) => {
      const result = await client.fileUploadCancel(token);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );
}
