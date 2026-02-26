# Testing Guide

## Framework

[Vitest](https://vitest.dev/) with `fileParallelism: false` (required because tests share a single branch).

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Environment Variables

Tests require the same environment variables as the server: `NOVA_HOST`, `NOVA_CMS_USER`, `NOVA_CMS_PASSWORD`, `NOVA_INDEX_USER`, `NOVA_INDEX_PASSWORD`.

Tests skip gracefully when variables are missing:

```typescript
let envVarsMissing = false;
try {
  validateEnvVars();
} catch {
  envVarsMissing = true;
}
const integrationDescribe = envVarsMissing ? describe.skip : describe;
```

## Test Fixture System

Shared fixtures are managed via a lazy singleton in `tests/fixtures/test-context.ts`:

```typescript
const ctx = await getTestContext();
if (!ctx) return; // API unreachable, skip test
```

`getTestContext()` runs once per test session:
1. **Cleanup** — finds and deletes all `MCP-*` prefixed types via Index search
2. **Setup** — creates MCP-Company and MCP-Person types with attributes, forms, app area, and sample data
3. **Returns** a `TestFixtureContext` with all created IDs

### TestFixtureContext Shape

```typescript
{
  companyTypeId, personTypeId,
  companyAttrIds: { name, industry },
  personAttrIds: { vorname, nachname, email, companyRef },
  companyFormId, personFormId, appAreaId,
  sampleCompanyId, samplePersonId,
}
```

## Key Constants

- `BRANCH_ID = 2100347` — shared test branch "MCP" (from `tests/setup.ts`)
- Never hardcode object IDs — always use `getTestContext()` for dynamic IDs

## Writing a New Test

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { validateEnvVars, createCmsApiClient, BRANCH_ID } from "../setup.js";
import { createCmsClient } from "../../src/cms-api/client.js";

let envVarsMissing = false;
try { validateEnvVars(); } catch { envVarsMissing = true; }

const integrationDescribe = envVarsMissing ? describe.skip : describe;

integrationDescribe("Feature Name", () => {
  let client: ReturnType<typeof createCmsClient>;

  beforeAll(() => {
    const api = createCmsApiClient();
    client = createCmsClient(api);
  });

  it("should do something", async () => {
    const result = await client.someMethod(String(BRANCH_ID), ...);
    expect(result).toBeDefined();
  });
});
```

## Naming Conventions

- Test files: `tests/<domain>/<feature>.test.ts`
- Fixture types use `MCP-` prefix for easy cleanup
- `describe` blocks group related operations
