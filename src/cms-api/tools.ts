import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createWriteStream, openAsBlob } from "node:fs";
import { stat, mkdir } from "node:fs/promises";
import { join, resolve, sep, basename, dirname, isAbsolute } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
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

async function streamToDisk(
  body: ReadableStream,
  filePath: string,
): Promise<number> {
  await mkdir(dirname(filePath), { recursive: true });
  const nodeStream = Readable.fromWeb(body as import("node:stream/web").ReadableStream);
  await pipeline(nodeStream, createWriteStream(filePath));
  const { size } = await stat(filePath);
  return size;
}

function resolvePath(workspaceDir: string, path: string): string {
  if (isAbsolute(path) || /^[a-zA-Z]:/.test(path)) {
    throw new Error(`Absolute paths are not allowed. Use a relative path within the workspace directory.`);
  }
  const resolved = resolve(workspaceDir, path);
  if (!resolved.startsWith(workspaceDir + sep) && resolved !== workspaceDir) {
    throw new Error(`Path must not escape the workspace directory.`);
  }
  return resolved;
}

export function registerCmsTools(server: McpServer, client: CmsClient, workspaceDir: string) {
  // --- Read tools ---

  server.tool(
    "novadb_cms_get_object",
    "Fetch a single CMS object by ID. Returns meta (id, typeRef, apiIdentifier) and values as attribute/language/variant tuples.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      id: z.string().describe("Object ID, GUID, or ApiIdentifier"),
      inherited: z.boolean().optional().describe("Include inherited values (default: false). Recommended: always set to true to avoid missing data."),
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
      inherited: z.boolean().optional().describe("Include inherited values (default: false). Recommended: always set to true to avoid missing data."),
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
    "List objects of a specific type with pagination (default: 5 results). Best for schema browsing (types, attributes, forms) — for searching data objects, prefer novadb_index_search_objects instead. Use 'continue' token for next page. Limit meta-types (typeRef=0) with 'attributes' and small 'take'.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      type: z.string().describe("Object type ID, GUID, or ApiIdentifier"),
      deleted: z.boolean().optional().describe("Filter by deleted status"),
      inherited: z.boolean().optional().describe("Include inherited values (default: false). Recommended: always set to true to avoid missing data."),
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
    "Create one or more objects. Each requires meta.typeRef (the object type ID) and values[]. For multi-value ObjRef attributes, send separate CmsValue entries with sortReverse 0, 1, 2... (not arrays). For language-dependent attributes (e.g. name attr 1000), send separate entries per language (201=EN, 202=DE). Returns { createdObjectIds: number[] } — use get_object to fetch full data after creation.",
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
    "Update one or more objects. Each needs meta.id (or meta.guid), meta.typeRef, and values[] to set. IMPORTANT: For multi-value attributes, read the object first (get_object with inherited=true) then send the COMPLETE value set — omitted entries are deleted. Only single-value attributes can be sent in isolation. Returns { updatedObjects, createdValues }.",
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
    "Soft-delete objects by IDs (can be restored). Consider using novadb_index_object_xml_link_count first to check for references. Returns { deletedObjects: number }.",
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
    "Fetch a single branch by ID. Returns a CmsObject with meta and values. Key attributes: 1000 (name, language-dependent), 4000 (parent branch), 4001 (branch type), 4002 (workflow state), 4003 (due date), 4004 (assigned to).",
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
    "List comments with optional filters (branch, object, user, deleted status). Paginated via 'continue' token (default: 5 results). Returns comment body as XHTML, author, and timestamps.",
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
    "Fetch a single comment by ID. Returns comment body as XHTML (with <div> root), author, timestamps, and object reference.",
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
    "Permanently delete a comment by ID. Returns 204 No Content.",
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
    "Generate C# typed model classes for object types in a branch and save to disk. Returns metadata (file path, size, content type) instead of source code. Only 'csharp' is supported.",
    {
      branch: z.string().describe("Branch ID or 'draft'"),
      language: z.string().describe("Programming language. Only 'csharp' is supported."),
      ids: z.string().optional().describe("Comma-separated type IDs to filter"),
      targetPath: z.string().optional().describe("Relative filename within the workspace directory. Absolute paths are not allowed. If omitted, saves to codegen-<branch>-<language>.cs."),
    },
    async ({ branch, language, ids, targetPath }) => {
      const result = await client.getCodeGeneratorTypes(branch, language, { ids });
      const filePath = resolvePath(workspaceDir, targetPath ?? `codegen-${branch}-${language}.cs`);
      const sizeBytes = await streamToDisk(result.body, filePath);
      const metadata = {
        filePath,
        sizeBytes,
        contentType: result.contentType,
      };
      return { content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_code_generator_type",
    "Generate a C# typed model class for a single object type. Returns source code with strongly-typed properties. Only 'csharp' is supported.",
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
    "Fetch execution logs for a job and save to disk. Returns metadata (file path, size, content type) instead of log content. Use targetPath to save to a meaningful location.",
    {
      jobId: z.string().describe("Job ID"),
      targetPath: z.string().optional().describe("Relative filename within the workspace directory. Absolute paths are not allowed. If omitted, saves to job-<jobId>-logs.txt."),
    },
    async ({ jobId, targetPath }) => {
      const result = await client.getJobLogs(jobId);
      const filePath = resolvePath(workspaceDir, targetPath ?? `job-${jobId}-logs.txt`);
      const sizeBytes = await streamToDisk(result.body, filePath);
      const metadata = {
        filePath,
        sizeBytes,
        contentType: result.contentType,
      };
      return { content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }] };
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
    "Permanently delete a job and its artifacts. Cannot be undone.",
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
    "Download a specific job artifact by path and save to disk. Returns metadata (file path, size, content type) instead of file content. Use targetPath to save to a meaningful location.",
    {
      jobId: z.string().describe("Job ID"),
      path: z.string().describe("Artifact path"),
      targetPath: z.string().optional().describe("Relative filename within the workspace directory. Absolute paths are not allowed. If omitted, saves to job-<jobId>-artifacts/<path>."),
    },
    async ({ jobId, path, targetPath }) => {
      const result = await client.getJobArtifact(jobId, path);
      const filePath = resolvePath(workspaceDir, targetPath ?? join(`job-${jobId}-artifacts`, path));
      const sizeBytes = await streamToDisk(result.body, filePath);
      const metadata = {
        filePath,
        sizeBytes,
        contentType: result.contentType,
      };
      return { content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_get_job_artifacts_zip",
    "Download all job artifacts as a ZIP and save to disk. Returns metadata (file path, size, content type) instead of file content. Use targetPath to save to a meaningful location.",
    {
      jobId: z.string().describe("Job ID"),
      targetPath: z.string().optional().describe("Relative filename within the workspace directory. Absolute paths are not allowed. If omitted, saves to job-<jobId>-artifacts.zip."),
    },
    async ({ jobId, targetPath }) => {
      const result = await client.getJobArtifactsZip(jobId);
      const filePath = resolvePath(workspaceDir, targetPath ?? `job-${jobId}-artifacts.zip`);
      const sizeBytes = await streamToDisk(result.body, filePath);
      const metadata = {
        filePath,
        sizeBytes,
        contentType: result.contentType,
      };
      return { content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }] };
    }
  );

  // --- Job Input tools ---

  server.tool(
    "novadb_cms_job_input_upload",
    "Upload a job input file from disk. Returns { token } for use in create_job's inputFile parameter.",
    {
      sourcePath: z.string().describe("Relative filename within the workspace directory. Absolute paths are not allowed."),
      filename: z.string().optional().describe("Override filename (defaults to basename of sourcePath)"),
    },
    async ({ sourcePath, filename }) => {
      const resolved = resolvePath(workspaceDir, sourcePath);
      const blob = await openAsBlob(resolved);
      const name = filename ?? basename(resolved);
      const result = await client.jobInputUpload(blob, name);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "novadb_cms_job_input_continue",
    "Continue a chunked job input upload from disk. Use token from previous upload call.",
    {
      token: z.string().describe("Upload token from previous upload call"),
      sourcePath: z.string().describe("Relative filename within the workspace directory. Absolute paths are not allowed."),
      filename: z.string().optional().describe("Override filename (defaults to basename of sourcePath)"),
    },
    async ({ token, sourcePath, filename }) => {
      const resolved = resolvePath(workspaceDir, sourcePath);
      const blob = await openAsBlob(resolved);
      const name = filename ?? basename(resolved);
      const result = await client.jobInputContinue(token, blob, name);
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
    "Download a file by name and save it to disk. Returns metadata (file path, size, content type) instead of file content. Use targetPath to save to a meaningful location, otherwise saves to a temp directory.",
    {
      name: z.string().describe("File identifier returned by upload (fileIdentifier + extension, e.g. '5fe618811cca585a2826a2da06e3ce1b.png'). On existing binary objects, read attribute 11000 for the identifier and 11005 for the extension."),
      targetPath: z.string().optional().describe("Relative filename within the workspace directory. Absolute paths are not allowed. If omitted, saves to <name> in workspace directory."),
    },
    async ({ name, targetPath }) => {
      const result = await client.getFile(name);
      const filePath = resolvePath(workspaceDir, targetPath ?? name);
      const sizeBytes = await streamToDisk(result.body, filePath);
      const metadata = {
        filePath,
        sizeBytes,
        contentType: result.contentType,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }],
      };
    }
  );

  server.tool(
    "novadb_cms_upload_file",
    "Start uploading a file from disk. Returns { token, fileIdentifier }. Set commit=true for single-chunk uploads.",
    {
      sourcePath: z.string().describe("Relative filename within the workspace directory. Absolute paths are not allowed."),
      filename: z.string().optional().describe("Override filename (defaults to basename of sourcePath)"),
      extension: z.string().describe("File extension without dot, e.g. 'jpg', 'pdf'"),
      commit: z.boolean().describe("Whether to commit the upload immediately (true for single-chunk uploads)"),
    },
    async ({ sourcePath, filename, extension, commit }) => {
      const resolved = resolvePath(workspaceDir, sourcePath);
      const blob = await openAsBlob(resolved);
      const name = filename ?? basename(resolved);
      const result = await client.fileUploadStart(blob, name, extension, commit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  server.tool(
    "novadb_cms_upload_file_continue",
    "Continue a chunked file upload from disk. Set commit=true on the final chunk.",
    {
      sourcePath: z.string().describe("Relative filename within the workspace directory. Absolute paths are not allowed."),
      filename: z.string().optional().describe("Override filename (defaults to basename of sourcePath)"),
      extension: z.string().describe("File extension (e.g. 'jpg', 'pdf')"),
      commit: z.boolean().describe("Whether to commit the upload (true for the final chunk)"),
      token: z.string().describe("Upload token from the start call"),
    },
    async ({ sourcePath, filename, extension, commit, token }) => {
      const resolved = resolvePath(workspaceDir, sourcePath);
      const blob = await openAsBlob(resolved);
      const name = filename ?? basename(resolved);
      const result = await client.fileUploadContinue(blob, name, extension, commit, token);
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
