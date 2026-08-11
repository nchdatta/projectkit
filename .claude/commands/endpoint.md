---
description: Build one API resource end-to-end — zod schema, route handler, service, query hooks, tests
argument-hint: <resource> [operations, e.g. list create update delete]
---

Build the API layer for: **$ARGUMENTS**

The common case in Flowly — an endpoint plus the client plumbing to reach it, no UI. Follow the layering contract in `AGENTS.md` exactly, in this order. Never skip a layer or merge two.

1. **Schema check** — read `prisma/schema.prisma`. If the resource has no model, stop and tell the user; `/migrate` handles that first.
2. **Validation** — `src/lib/validations/<resource>.ts`: zod schemas per mutating operation, plus list query params. Export from `src/lib/validations/index.ts`.
3. **`api-builder`** — `src/app/api/<resource>/route.ts` for collection operations, `src/app/api/<resource>/[id]/route.ts` for item operations.
4. **`service-builder`** — entity types in `src/services/types.ts`, both service files, keys in `src/lib/query-keys.ts`, then `use-<resource>-query.ts` and `use-<resource>-mutation.ts`.
5. **`test-author`** — MSW-backed service tests covering the success and `ApiError` paths, plus an `e2e` API contract check.
6. **Verify** — `npm run verify`, then report the routes, methods, and hook names that now exist.

Report each layer as it completes so the user can stop you early if a shape is wrong.
