export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface ApiClientConfig {
  baseUrl: string;
  user: string;
  password: string;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.authHeader = `Basic ${Buffer.from(`${config.user}:${config.password}`).toString("base64")}`;
  }

  async get(path: string, params: QueryParams = {}): Promise<unknown> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      headers: {
        Authorization: this.authHeader,
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status}: ${body}`);
    }
    return response.json();
  }

  async post(
    path: string,
    body: unknown,
    params: QueryParams = {},
    headers: Record<string, string> = {},
  ): Promise<unknown> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async patch(
    path: string,
    body: unknown,
    params: QueryParams = {},
    headers: Record<string, string> = {},
  ): Promise<unknown> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: this.authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async delete(
    path: string,
    body?: unknown,
    params: QueryParams = {},
    headers: Record<string, string> = {},
  ): Promise<unknown> {
    const url = this.buildUrl(path, params);
    const init: RequestInit = {
      method: "DELETE",
      headers: {
        Authorization: this.authHeader,
        Accept: "application/json",
        ...headers,
      },
    };
    if (body !== undefined) {
      (init.headers as Record<string, string>)["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    const response = await fetch(url, init);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return {};
  }

  async postFormData(path: string, formData: FormData, params: QueryParams = {}): Promise<unknown> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: this.authHeader, Accept: "application/json" },
      body: formData,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async putFormData(path: string, formData: FormData, params: QueryParams = {}): Promise<unknown> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      method: "PUT",
      headers: { Authorization: this.authHeader, Accept: "application/json" },
      body: formData,
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
  }

  async getRaw(path: string, params: QueryParams = {}): Promise<Response> {
    const url = this.buildUrl(path, params);
    const response = await fetch(url, {
      headers: { Authorization: this.authHeader },
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status}: ${body}`);
    }
    return response;
  }

  buildUrl(path: string, params: QueryParams = {}): string {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }
}
