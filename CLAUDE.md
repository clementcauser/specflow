# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run dev:test         # Start dev server with DISABLE_EMAILS=true (for Cypress)
npm run build            # prisma generate + next build
npm run lint             # ESLint

# Database
npx prisma migrate dev   # Apply pending migrations + generate client
npx prisma migrate status
npx prisma generate      # Regenerate client after schema changes

# Tests (E2E Cypress)
npm run cypress:run      # Start server + run all tests headlessly
npm run cypress:open     # Start server + open Cypress UI

# Run a single spec file
npx cypress run --spec "cypress/e2e/settings.cy.ts"
# Note: requires the dev server already running (npm run dev:test), or use:
npm run cypress:run -- --spec "cypress/e2e/settings.cy.ts"
```

## Architecture

### App structure

Next.js 14 App Router. Two route groups:

- `src/app/(auth)/` — public pages (sign-in, sign-up, onboarding)
- `src/app/(dashboard)/` — protected pages, all wrapped in a layout that enforces auth and redirects to `/onboarding` if the user has no workspace

The dashboard layout resolves the active workspace from `user.activeWorkspaceId` (stored on the User row), falling back to the user's first membership.

### Multi-tenant model

`User` → many `Workspace` via `Member` (role: OWNER/ADMIN/MEMBER/VIEWER). The "active workspace" is tracked on `User.activeWorkspaceId` and switched via `switchActiveWorkspace()` in `src/actions/tenant.ts`.

Three workspace types drive different UX flows:
- **AGENCY** — organizes work around Clients → Projects → Specs
- **PRODUCT** — organizes work around Epics → Specs (no clients)
- **FREELANCE** — similar to AGENCY but single-operator focused

### Spec generation flow

1. User fills a form → `createSpec()` server action saves a `DRAFT` spec with `content: { _sections: [...] }`
2. User is redirected to `/specs/[id]/generate`
3. That page calls `POST /api/specs/generate` which streams SSE
4. The API builds a prompt using `buildWorkspaceContext()` + `buildPersona()` + `buildPrompt()` and calls Claude Sonnet via `@anthropic-ai/sdk`
5. Claude returns sections delimited by `[SECTION:key]` tags; the API parses them in real time and sends `section_start` / `section_done` / `done` events
6. On completion the spec is saved as `DONE` with content `{ summary, personas, userStories, acceptance, outOfScope, questions }`

Sections are defined in `src/types/spec.ts` (`SECTIONS_CONFIG`). `summary` is always generated; others are opt-in via the `_sections` array stored at spec creation.

### Auth

Better Auth (`src/lib/auth.ts`, `src/lib/auth-client.ts`). Session helpers in `src/lib/session.ts`:
- `requireSession()` — use in server components/actions, redirects to `/sign-in` if unauthenticated
- `getSessionWithWorkspace()` — extends session with workspace memberships

### Server actions pattern

All mutations go through `"use server"` actions in `src/actions/`. They always:
1. Call `requireSession()` to get the user
2. Verify the user is a member of the target workspace before touching data
3. Call `revalidatePath()` after mutations

**Never call internal API routes from server actions** — pass auth context directly (the Stripe billing bug was caused by this pattern).

### Integrations

Each integration follows the same pattern:
- OAuth flow: `GET /api/integrations/[provider]/connect` → redirect → `GET /api/integrations/[provider]/callback` → save token to DB
- Export: `POST /api/integrations/[provider]/export`
- Business logic in `src/lib/[provider].ts` and `src/lib/[provider]-export.ts`
- Prisma models: `NotionIntegration`, `GitIntegration`, `TrelloIntegration`, `ClickUpIntegration`, `JiraIntegration`

### Billing

Stripe integration. Plans: FREE (3 specs/month), PRO, MAX. Plan limits enforced in `src/lib/plan-limits.ts` via `canCreateSpec()`. Stripe webhooks update `Workspace.plan`, `subscriptionStatus`, `currentPeriodEnd`. Portal/Checkout handled via server actions in `src/actions/billing.ts` that call Stripe directly (no internal fetch).

### Types

`src/types/workspaces.ts` — pure TypeScript re-exports of Prisma enums (required because Prisma-generated enums cannot be imported in Client Components). Always use these in client code instead of `@/generated/prisma/client`.

### Prisma

Client generated to `src/generated/prisma/`. Always run `npx prisma generate` after schema changes. The `PrismaPg` adapter is used (PostgreSQL via `pg`).

### E2E tests

Cypress tests in `cypress/e2e/`. The `cypress.config.ts` registers Prisma-based tasks (`verifyUser`, `seedWorkspace`, `seedSpec`, etc.) for DB seeding/cleanup. Tests create real users, seed data, then delete everything in `after()`. Use `generateUid()` from `cypress/support/utils.ts` for unique test identifiers.
