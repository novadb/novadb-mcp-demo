import { ApiClient } from "../src/http-client.js";

/**
 * Validates that all required environment variables for integration tests are set.
 * Throws an error with a clear message if any are missing.
 */
export function validateEnvVars(): void {
  const requiredEnvVars = [
    "NOVA_HOST",
    "NOVA_CMS_USER",
    "NOVA_CMS_PASSWORD",
    "NOVA_INDEX_USER",
    "NOVA_INDEX_PASSWORD",
  ];
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar] || process.env[envVar]?.trim() === ""
  );

  if (missing.length > 0) {
    const missingList = missing.join(", ");
    throw new Error(
      `Missing required environment variables for integration tests: ${missingList}\n` +
        `Set them before running tests:\n` +
        `  NOVA_HOST=https://... NOVA_CMS_USER=... NOVA_CMS_PASSWORD=...\n` +
        `  NOVA_INDEX_USER=... NOVA_INDEX_PASSWORD=... npm test`
    );
  }
}

/**
 * Normalizes NOVA_HOST: adds https:// if no protocol is present,
 * and removes trailing slashes.
 */
function normalizeHost(host: string): string {
  let normalized = host;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  return normalized.replace(/\/+$/, "");
}

/**
 * Factory function to create an authenticated Index API client for tests.
 * Uses NOVA_HOST, NOVA_INDEX_USER, and NOVA_INDEX_PASSWORD env vars.
 */
export function createIndexApiClient(): ApiClient {
  validateEnvVars();
  const host = normalizeHost(process.env.NOVA_HOST!);
  return new ApiClient({
    baseUrl: `${host}/apis/index/v1`,
    user: process.env.NOVA_INDEX_USER!,
    password: process.env.NOVA_INDEX_PASSWORD!,
  });
}

/**
 * Factory function to create an authenticated CMS API client for tests.
 * Uses NOVA_HOST, NOVA_CMS_USER, and NOVA_CMS_PASSWORD env vars.
 */
export function createCmsApiClient(): ApiClient {
  validateEnvVars();
  const host = normalizeHost(process.env.NOVA_HOST!);
  return new ApiClient({
    baseUrl: `${host}/apis/cms/v1`,
    user: process.env.NOVA_CMS_USER!,
    password: process.env.NOVA_CMS_PASSWORD!,
  });
}

/**
 * Branch ID to use for all integration tests.
 * Ensures tests run against a consistent, known branch.
 */
export const BRANCH_ID = 2100347;
