# Testing Guide

## Quick Start

All tests run against a temporary local PostgreSQL instance — no external database or credentials needed.

### Prerequisites

PostgreSQL binaries (`initdb`, `pg_ctl`, `psql`, `pg_isready`) must be on your PATH. On NixOS this is handled by the dev flake:

```bash
nix develop
```

### Running Tests

```bash
# All tests
pnpm test

# One domain
pnpm vitest run tests/domains/orgs/

# One file
pnpm vitest run tests/domains/orgs/org.test.ts

# Watch mode (re-runs on file change)
pnpm vitest tests/domains/social/
```

On NixOS, wrap with `nix develop` if you're not already in the dev shell:

```bash
nix develop --command bash -c "pnpm test"
```

## What Happens When You Run Tests

1. A temporary Postgres starts on **port 5433** with data stored in `.pg-test/` (gitignored).
2. A `figuregraph_test` database is created and the full Drizzle schema is pushed to it.
3. Tests run sequentially — each file truncates all tables in `beforeEach` so every test starts with a clean database.
4. Postgres is stopped automatically when the test run finishes.

The `.pg-test/` directory persists between runs so subsequent runs skip `initdb` and are faster. Delete it to force a clean start:

```bash
rm -rf .pg-test
```

## Test Structure

```
tests/
  setup/
    global-setup.ts      # Starts Postgres, creates DB, pushes schema
    global-teardown.ts    # Stops Postgres
    vitest-setup.ts       # Mocks Clerk auth, Ably, and redirects DB
    test-db.ts            # Test database connection (pg.Pool + Drizzle)
    helpers.ts            # Factories (createUser, createOrg, ...) and truncateAll
  domains/
    syllabus/             # dance.test.ts, figure.test.ts
    routines/             # routine.test.ts
    social/               # profile, follow, post, feed, comment, like, save, notification
    orgs/                 # org, membership, invite, join-request, org-post
    messaging/            # conversation, message
```

Tests mirror the `src/domains/` structure. Each test file covers one tRPC router.

## Writing a Test

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createCaller, createUser, truncateAll } from "../../setup/helpers";

describe("my-router", () => {
  let userId: string;

  beforeEach(async () => {
    await truncateAll();
    const user = await createUser();
    userId = user.id;
  });

  it("creates a thing", async () => {
    const caller = createCaller(userId);
    const result = await caller.myRouter.create({ name: "test" });
    expect(result.name).toBe("test");
  });

  it("rejects unauthorized access", async () => {
    const other = await createUser();
    const caller = createCaller(other.id);
    await expect(
      caller.myRouter.delete({ id: 1 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
```

Key patterns:
- **`truncateAll()`** in `beforeEach` — every test gets a clean database
- **`createUser()`** before **`createCaller(userId)`** — the user row must exist in the DB
- **`createPublicCaller()`** — for testing unauthenticated/public routes
- **`rejects.toMatchObject({ code: "..." })`** — assert tRPC error codes

## Available Factories

| Factory | Creates |
|---------|---------|
| `createUser(overrides?)` | User with auto-generated id, username, displayName |
| `createDance(overrides?)` | Dance with auto-generated name |
| `createFigure(danceId, overrides?)` | Figure linked to a dance |
| `createPost(authorId, overrides?)` | Published post |
| `createOrg(ownerId, overrides?)` | Organization + owner membership |
| `createConversation(type, memberIds, overrides?)` | Conversation with members added |

All factories accept an `overrides` object to set specific fields. They return the full inserted row.

## Checking the Test Database Directly

While tests are running (or if Postgres is still up from a previous run), you can connect:

```bash
psql "postgresql://$USER@localhost:5433/figuregraph_test?host=$(pwd)/.pg-test"
```

To manually start/stop the test Postgres:

```bash
# Start
pg_ctl start -D .pg-test/data -l .pg-test/postgres.log -o "-p 5433 -k $(pwd)/.pg-test"

# Stop
pg_ctl stop -D .pg-test/data -m fast
```

## Troubleshooting

**Tests fail with "connection refused" or "could not connect"**
- Postgres didn't start. Check `.pg-test/postgres.log` for errors.
- Make sure port 5433 isn't already in use: `lsof -i :5433`
- Delete `.pg-test/` and retry to force a fresh init.

**Tests fail with duplicate key or phantom data**
- This was caused by concurrent test file execution. The fix (`fileParallelism: false` in `vitest.config.ts`) is already in place. If you see this again, make sure that setting hasn't been removed.

**"No test suite found" errors**
- Vitest may be picking up non-vitest test files in `src/`. The `include: ["tests/**/*.test.ts"]` in `vitest.config.ts` prevents this. Don't broaden it.

**Schema changes not reflected in tests**
- Delete `.pg-test/` to force a full re-init, or just re-run tests (global setup always runs `drizzle-kit push`).
- If you added a new domain schema file, make sure it's listed in `drizzle.config.ts`, imported in `tests/setup/test-db.ts`, and its tables are in `truncateAll()`.
