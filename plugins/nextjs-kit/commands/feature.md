---
description: Build a full vertical slice — schema, API, services, hooks, UI, tests
argument-hint: <feature description>
---

Build this feature end-to-end: **$ARGUMENTS**

Work through the layering contract in `AGENTS.md` in order, delegating each layer to its owning agent. Report after each step; do not run them all silently. No layer skipping and no shortcuts around the contract's hard rules, however small the feature looks.

1. **Plan** — restate the feature as: models touched, endpoints needed, screens needed. If any part is ambiguous (a field's meaning, a status transition, who can see what), ask before writing code.
2. **`data-modeler`** — schema changes + migration. Skip if no model change is needed.
3. **`api-builder`** — zod schemas + route handlers.
4. **`service-builder`** — entity types, both service files, keys in `src/lib/query-keys.ts`, query and mutation hooks.
5. **`ui-builder`** — components and pages, consuming the hooks.
6. **`test-author`** — MSW service tests, component tests, and an e2e spec for the user-visible flow.
7. **Verify** — `npm run verify`, then `npm run test:e2e` if a dev server is available.

Finish with a summary: files added by layer, the endpoints and hooks now available, and the verification output.
