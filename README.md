projectkit is a layered Next.js reference app and the host for the `nextjs-kit` and `nextjs-frontend-kit` Claude Code plugins. The app itself is a small CRM (leads, customers, pipelines, follow-ups) used as the worked example for the layering contract.

Next.js 16 (App Router) · React 19 · Tailwind 4 · Prisma 7 · PostgreSQL · TanStack Query · Vitest + Playwright.

## Getting started

```bash
cp .env.example .env      # then set your local postgres password
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `GET /api/leads` is the reference endpoint — proves handler → envelope → Prisma → Postgres is wired.

## Commands

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm run verify`     | typecheck + lint + unit tests — **the gate** |
| `npm run dev`        | dev server                                   |
| `npm run test`       | Vitest (MSW-backed)                          |
| `npm run test:e2e`   | Playwright                                   |
| `npm run db:migrate` | create + apply a migration                   |
| `npm run db:studio`  | Prisma Studio                                |

## Architecture

Requests flow one way:

```
client:  components → query hooks → *.service.client.ts (axios) → route handlers → Prisma → Postgres
server:  server components ──────→ *.service.ts (fetch) ────────→ route handlers → Prisma → Postgres
```

Route Handlers under `src/app/api` are the API. Services in `src/services` are the only callers of HTTP — one file per entity per side, with mutations only on the client side. Server Actions are used only for `revalidatePath`/`revalidateTag`.

The full contract, including the Next 16 and Prisma 7 gotchas that trip up code generation, is in [AGENTS.md](AGENTS.md).

## nextjs-kit plugin

This repo hosts and dogfoods the `nextjs-kit` Claude Code plugin — agents, commands, rules, and a planning skill under [plugins/nextjs-kit](plugins/nextjs-kit), built for this same layered Next.js + Prisma + TanStack Query stack. Install it in another project with:

```
/plugin marketplace add nchdatta/projectkit
/plugin install nextjs-kit@nchdatta
```

Then run `/nextjs-kit:init-rules` once to copy the rule files into that project's own `.claude/rules/` (rules only auto-load from a project's own directory, so the plugin ships them as payload) and scaffold an `AGENTS.md` if one is missing.

### Agents

| Agent             | Owns                                                       | Use for                                                                    |
| ----------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `data-modeler`    | `prisma/`                                                  | New model, field, enum, relation, migration                                |
| `api-builder`     | `src/app/api/**/route.ts`, `src/lib/validations`           | New or changed REST endpoint                                               |
| `service-builder` | `src/services`, `src/hooks/queries`, `src/hooks/mutations` | Exposing an endpoint to the client — types, service functions, query hooks |
| `ui-builder`      | `src/components`, pages under `src/app`                    | Screens, forms, tables, layout                                             |
| `test-author`     | Vitest (MSW) + Playwright specs                            | Coverage after a feature lands                                             |

### Commands

| Command                             | What it does                                                          |
| ----------------------------------- | --------------------------------------------------------------------- |
| `/nextjs-kit:feature <description>` | Build a full vertical slice — schema, API, services, hooks, UI, tests |
| `/nextjs-kit:endpoint <resource>`   | Build one API resource end-to-end                                     |
| `/nextjs-kit:migrate <change>`      | Change the Prisma schema, produce a reviewed migration                |
| `/nextjs-kit:review [scope]`        | Review the working diff against the layering contract                 |
| `/nextjs-kit:verify`                | Run typecheck + lint + tests, report failures by gate                 |
| `/nextjs-kit:init-rules`            | One-time setup in a new project — copy rules, scaffold `AGENTS.md`    |

### Skill

`feature-plan` — triggered by natural language ("plan this", "spec this out") or describing something to build. Inspects the codebase, then writes `docs/<feature>/brief.md` and `plan.md` before any code is touched.

### Rules (`.claude/rules/`)

| File                        | Covers                                                                      |
| --------------------------- | --------------------------------------------------------------------------- |
| `engineering-principles.md` | DRY, single responsibility, composition, KISS, YAGNI, type safety           |
| `frontend.md`               | Component files, props, JSX, client/server split, state, styling            |
| `backend.md`                | Route handler files, response style, error handling                         |
| `database.md`               | Prisma model conventions, snake_case columns, indexes, migrations           |
| `react-performance.md`      | Parallel async, RSC composition, Server Action auth, lazy loading, Suspense |

Also ships a `PostToolUse` hook that formats every file an agent writes, and a `bin/init-rules.mjs` installer behind the skill above.

## nextjs-frontend-kit plugin

Same marketplace, different shape — [plugins/nextjs-frontend-kit](plugins/nextjs-frontend-kit) is for a **frontend-only** Next.js app that talks to a separate backend API over `NEXT_PUBLIC_API_BASE_URL`. No Prisma, no route handlers, no service layer — just components, forms, TanStack Query against the API, and tests. Extracted from a real frontend-only project's `.claude/` setup. Install:

```
/plugin marketplace add nchdatta/projectkit
/plugin install nextjs-frontend-kit@nchdatta
```

Then run its `init-rules` skill once to copy the rule files into that project's `.claude/rules/` and scaffold an `AGENTS.md` if missing.

### Agents

| Agent               | Owns                                    | Use for                                               |
| ------------------- | --------------------------------------- | ----------------------------------------------------- |
| `ui-builder`        | `src/components`, pages under `src/app` | Screens, forms, layout, styling                       |
| `test-author`       | Vitest (MSW) + Playwright specs         | Coverage after a feature lands                        |
| `frontend-reviewer` | read-only                               | Review a diff/branch against scope boundaries + rules |

### Commands

| Command                               | What it does                                          |
| ------------------------------------- | ----------------------------------------------------- |
| `/nextjs-frontend-kit:review [scope]` | Review the working diff against scope + conventions   |
| `/nextjs-frontend-kit:verify`         | Run typecheck + lint + tests, report failures by gate |

### Skill

`init-rules` — one-time setup in a new project: copies `rules/*.md` into `.claude/rules/`, scaffolds `AGENTS.md` from `templates/AGENTS.md` if missing, reports what still needs doing by hand (permissions, stack mismatches, auth scheme).

### Rules (`.claude/rules/`)

| File                        | Covers                                                             |
| --------------------------- | ------------------------------------------------------------------ |
| `engineering-principles.md` | DRY, single responsibility, composition, KISS, YAGNI, type safety  |
| `frontend.md`               | Component files, props, JSX, client/server split, state, styling   |
| `react-performance.md`      | Parallel async, RSC composition, Server Action scope, lazy loading |

No `backend.md`, no `database.md` — this kit assumes the backend is someone else's repo.

## Agentic tooling

This repo is set up for AI coding agents:

- `AGENTS.md` / `CLAUDE.md` — project rules, read automatically at session start.
- `.claude/agents/`, `.claude/commands/`, `.claude/rules/` — the same components listed above, used locally rather than through the plugin.
- `.claude/hooks/format.mjs` — formats every file an agent writes.
- `.mcp.json` — Next.js devtools MCP (compilation errors, routes, logs from the running dev server) and Playwright MCP (browser view).
