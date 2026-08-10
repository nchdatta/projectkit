Flowly is a simple, modern CRM designed to help businesses manage leads, customers, sales pipelines, follow-ups, and relationships in one organized workflow. It keeps customer management streamlined, intuitive, and easy to track from first contact to conversion.

Next.js 16 (App Router) · React 19 · Tailwind 4 · Prisma 7 · PostgreSQL · TanStack Query · Vitest + Playwright.

## Getting started

```bash
cp .env.example .env      # then set your local postgres password
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `GET /api/health` reports whether the database is reachable.

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

## Agentic tooling

This repo is set up for AI coding agents:

- `AGENTS.md` / `CLAUDE.md` — project rules, read automatically at session start.
- `.claude/agents/` — scoped subagents (`data-modeler`, `api-builder`, `service-builder`, `ui-builder`, `test-author`).
- `.claude/commands/` — `/feature`, `/endpoint`, `/migrate`, `/review`, `/verify`.
- `.claude/hooks/format.mjs` — formats every file an agent writes.
- `.mcp.json` — Next.js devtools MCP (compilation errors, routes, logs from the running dev server) and Playwright MCP (browser view).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
