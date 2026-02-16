import { ApiClient } from "../http-client.js";

export interface CmsValue {
  attribute: number;
  variant?: number;
  language?: number;
  value?: unknown;
  sortReverse?: number | null;
  unitRef?: number | null;
}

export interface CmsObjectMeta {
  id?: number;
  guid?: string;
  apiIdentifier?: string | null;
  typeRef: number;
  lastTransaction?: number;
  deleted?: boolean;
}

export interface CmsObject {
  meta: CmsObjectMeta;
  values?: CmsValue[];
}

function usernameHeader(username?: string): Record<string, string> {
  if (username) return { "X-CmsApi-Username": username };
  return {};
}

export function createCmsClient(api: ApiClient) {
  return {
    getObject: (branch: string, id: string, params: {
      inherited?: boolean;
      attributes?: string;
      variants?: string;
      languages?: string;
    } = {}) => api.get(`/branches/${branch}/objects/${id}`, params),

    getObjects: (branch: string, ids: string, params: {
      inherited?: boolean;
      attributes?: string;
      variants?: string;
      languages?: string;
    } = {}) => api.get(`/branches/${branch}/objects`, { ids, ...params }),

    getTypedObjects: (branch: string, type: string, params: {
      deleted?: boolean;
      inherited?: boolean;
      continue?: string;
      take?: number;
      attributes?: string;
      variants?: string;
      languages?: string;
    } = {}) => api.get(`/branches/${branch}/types/${type}/objects`, { ...params, take: params.take ?? 20 }),

    createObjects: (branch: string, objects: CmsObject[], params: {
      comment?: string;
      username?: string;
    } = {}) => api.post(
      `/branches/${branch}/objects`,
      { comment: params.comment ?? null, objects },
      {},
      usernameHeader(params.username),
    ),

    updateObjects: (branch: string, objects: CmsObject[], params: {
      comment?: string;
      username?: string;
    } = {}) => api.patch(
      `/branches/${branch}/objects`,
      { comment: params.comment ?? null, objects },
      {},
      usernameHeader(params.username),
    ),

    deleteObjects: (branch: string, objectIds: string[], params: {
      comment?: string;
      username?: string;
    } = {}) => api.delete(
      `/branches/${branch}/objects`,
      { comment: params.comment ?? null, objectIds },
      {},
      usernameHeader(params.username),
    ),

    // --- Branch tools ---

    getBranch: (id: string, params: {
      attributes?: string;
      variants?: string;
      languages?: string;
    } = {}) => api.get(`/branches/${id}`, params),

    createBranch: (values: CmsValue[], params: {
      comment?: string;
      username?: string;
    } = {}) => api.post(
      "/branches",
      { comment: params.comment ?? null, values },
      {},
      usernameHeader(params.username),
    ),

    updateBranch: (id: string, values: CmsValue[], params: {
      comment?: string;
      username?: string;
    } = {}) => api.patch(
      `/branches/${id}`,
      { comment: params.comment ?? null, values },
      {},
      usernameHeader(params.username),
    ),

    deleteBranch: (id: string, params: {
      comment?: string;
      username?: string;
    } = {}) => api.delete(
      `/branches/${id}`,
      { comment: params.comment ?? null },
      {},
      usernameHeader(params.username),
    ),

    getComments: (params: {
      branchRef?: number;
      objectRef?: number;
      user?: string;
      isDeleted?: boolean;
      continue?: string;
      take?: number;
    } = {}) => api.get("/comments", { ...params, take: params.take ?? 20 }),

    getComment: (commentId: string) =>
      api.get(`/comments/${commentId}`),

    createComment: (branchId: number, objectRef: number, body: string, params: {
      username?: string;
    } = {}) => api.post("/comments", { branchId, objectRef, body }, {}, usernameHeader(params.username)),

    updateComment: (commentId: string, body: string, params: {
      username?: string;
    } = {}) => api.patch(`/comments/${commentId}`, { body }, {}, usernameHeader(params.username)),

    deleteComment: (commentId: string, params: {
      username?: string;
    } = {}) => api.delete(`/comments/${commentId}`, undefined, {}, usernameHeader(params.username)),

    // --- Code Generator tools ---

    getCodeGeneratorTypes: async (branch: string, language: string, params: {
      ids?: string;
    } = {}) => {
      const response = await api.getRaw(`/branches/${branch}/generators/${language}/types`, params);
      return response.text();
    },

    getCodeGeneratorType: async (branch: string, language: string, type: string) => {
      const response = await api.getRaw(`/branches/${branch}/generators/${language}/types/${type}`);
      return response.text();
    },

    getJobs: (branchId: number, params: {
      definitionRef?: number;
      state?: number;
      triggerRef?: number;
      createdBy?: string;
      isDeleted?: boolean;
      continue?: string;
      take?: number;
    } = {}) => api.get("/jobs", { branchId, ...params, take: params.take ?? 20 }),

    getJob: (jobId: string) =>
      api.get(`/jobs/${jobId}`),

    getJobLogs: async (jobId: string) => {
      const response = await api.getRaw(`/jobs/${jobId}/logs`);
      return response.text();
    },

    createJob: (params: {
      branchId: number;
      jobDefinitionId: number;
      scopeIds?: number[];
      objIds?: number[];
      parameters?: { name: string; values: string[] }[];
      inputFile?: { token: string; name: string };
      language?: number;
      username?: string;
    }) => api.post("/jobs", {
      branchId: params.branchId,
      jobDefinitionId: params.jobDefinitionId,
      scopeIds: params.scopeIds,
      objIds: params.objIds,
      parameters: params.parameters,
      inputFile: params.inputFile,
      language: params.language,
    }, {}, usernameHeader(params.username)),

    updateJob: (jobId: string, params: {
      retainUntil?: string;
      state?: number;
      username?: string;
    } = {}) => api.patch(`/jobs/${jobId}`, {
      retainUntil: params.retainUntil ?? null,
      state: params.state ?? null,
    }, {}, usernameHeader(params.username)),

    deleteJob: (jobId: string, params: {
      username?: string;
    } = {}) => api.delete(`/jobs/${jobId}`, undefined, {}, usernameHeader(params.username)),

    getJobMetrics: (jobId: string, params: {
      maxItems?: number;
    } = {}) => api.get(`/jobs/${jobId}/metrics`, params),

    getJobProgress: (jobId: string) =>
      api.get(`/jobs/${jobId}/progress`),

    getJobObjectIds: (jobId: string) =>
      api.get(`/jobs/${jobId}/objectIds`),

    // --- Job Artifact tools ---

    getJobArtifacts: (jobId: string) =>
      api.get(`/jobs/${jobId}/artifacts`),

    getJobArtifact: async (jobId: string, path: string) => {
      const response = await api.getRaw(`/jobs/${jobId}/artifacts/${path}`);
      return response.text();
    },

    getJobArtifactsZip: async (jobId: string) => {
      const response = await api.getRaw(`/jobs/${jobId}/artifacts.zip`);
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString("base64");
    },

    // --- Job Input tools ---

    jobInputUpload: (file: Buffer, filename: string) => {
      const formData = new FormData();
      formData.append("file", new Blob([new Uint8Array(file)]), filename);
      return api.postFormData("/jobInput", formData);
    },

    jobInputContinue: (token: string, file: Buffer, filename: string) => {
      const formData = new FormData();
      formData.append("file", new Blob([new Uint8Array(file)]), filename);
      return api.postFormData(`/jobInput/${token}`, formData);
    },

    jobInputCancel: (token: string) =>
      api.delete(`/jobInput/${token}`),

    // --- File tools ---

    getFile: async (name: string) => {
      const response = await api.getRaw(`/files/${name}`);
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("text") || contentType.includes("json") || contentType.includes("xml")) {
        return { type: "text" as const, data: await response.text() };
      }
      const buffer = await response.arrayBuffer();
      return { type: "binary" as const, data: Buffer.from(buffer).toString("base64") };
    },

    fileUploadStart: (file: Buffer, filename: string, extension: string, commit: boolean) => {
      const formData = new FormData();
      formData.append("Extension", extension);
      formData.append("Commit", String(commit));
      formData.append("File", new Blob([new Uint8Array(file)]), filename);
      return api.postFormData("/fileUpload", formData);
    },

    fileUploadContinue: (file: Buffer, filename: string, extension: string, commit: boolean, token: string) => {
      const formData = new FormData();
      formData.append("Extension", extension);
      formData.append("Commit", String(commit));
      formData.append("File", new Blob([new Uint8Array(file)]), filename);
      return api.putFormData(`/fileUpload/${token}`, formData);
    },

    fileUploadCancel: (token: string) =>
      api.delete(`/fileUpload/${token}`),
  };
}

export type CmsClient = ReturnType<typeof createCmsClient>;
