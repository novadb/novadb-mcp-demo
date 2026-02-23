import { createCmsClient } from "../../src/cms-api/client.js";
import { createCmsApiClient, BRANCH_ID } from "../setup.js";
import { cleanupMcpTypes } from "./cleanup.js";
import { setupMcpTypes, type TestFixtureContext } from "./setup-types.js";

let contextPromise: Promise<TestFixtureContext | null> | undefined;

/**
 * Returns the test fixture context (lazy-initialized singleton).
 * On first call, runs cleanup + setup. Subsequent calls return cached result.
 * Returns null if setup fails (e.g. API unreachable), so tests can skip gracefully.
 * Promise-based caching prevents race conditions with parallel test execution.
 */
export function getTestContext(): Promise<TestFixtureContext | null> {
  if (!contextPromise) {
    contextPromise = initContext();
  }
  return contextPromise;
}

async function initContext(): Promise<TestFixtureContext | null> {
  try {
    const cmsApi = createCmsApiClient();
    const cms = createCmsClient(cmsApi);
    const branch = String(BRANCH_ID);

    // Clean up any existing MCP-* types from previous runs
    await cleanupMcpTypes(cms, branch);

    // Create fresh types, attributes, forms, app area, and sample data
    return await setupMcpTypes(cms, branch);
  } catch (error) {
    console.warn(
      `[MCP Test Setup] Failed to initialize test fixtures: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.warn("[MCP Test Setup] Tests requiring fixture context will be skipped.");
    return null;
  }
}
