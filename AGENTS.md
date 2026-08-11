<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Flowly

A CRM: leads → customers → pipelines → follow-ups. Single Next.js app, fullstack.

## Stack

| Layer           | Choice                                      | Notes                                                                                                        |
| --------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Framework       | Next.js 16.3, App Router                    | Docs bundled at `node_modules/next/dist/docs/` — read them, not memory                                       |
| UI              | React 19.2 + React Compiler                 | Compiler is **on**. Do not hand-write `useMemo`/`useCallback`/`memo`; it already does that                   |
| Styling         | Tailwind CSS 4 + shadcn/ui                  | CSS-first config in `src/styles/globals.css`. There is no `tailwind.config.js` and you should not create one |
| Data            | Prisma 7 + PostgreSQL 18 (local)            | Generated client is at `/generated/prisma`, project root, via the `@generated/*` alias (gitignored)          |
| Transport       | axios (client) / native `fetch` (server)    | `src/lib/http.ts` and `src/lib/fetcher.ts` — both export `request`                                           |
| Server state    | TanStack Query 5                            | Hooks in `src/hooks/queries`                                                                                 |
| Validation      | zod 4                                       | Schemas in `src/lib/validations`                                                                             |
| Forms           | react-hook-form + `@hookform/resolvers/zod` |                                                                                                              |
| Tests           | Vitest + MSW (unit), Playwright (e2e)       |                                                                                                              |
| Package manager | npm                                         | No pnpm/yarn/bun on this machine                                                                             |

## The layering contract

Every feature moves through the same files, in this order:

```
src/app/api/<resource>/route.ts               Route Handler — zod-parses input, calls Prisma, returns the envelope
src/lib/validations/<resource>.ts             zod schemas — shared by the handler and the form
src/services/types.ts                         entity type declarations, GetArg / ListArg
src/services/<resource>.service.ts            SERVER service — native fetch via lib/fetcher. Reads only
src/services/<resource>.service.client.ts     CLIENT service — axios. Reads + create/update/delete
src/lib/query-keys.ts                         every cache key, in one object
src/hooks/queries/use-<resource>-query.ts     read hooks for that resource
src/hooks/mutations/use-<resource>-mutation.ts write hooks for that resource
src/components/<feature>/*.tsx                UI
src/app/**/actions.ts                         Server Actions — ONLY revalidatePath / revalidateTag
```

Dependencies run one way: **components → hooks → client service → HTTP → route handlers → Prisma**, with Server Components reaching the same handlers through the server service.

### Two services per entity

Each resource has two service files, and they are not interchangeable:

|            | `<resource>.service.ts`                                                                  | `<resource>.service.client.ts`                       |
| ---------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Runs on    | server (RSC, Route Handlers, Server Actions)                                             | browser                                              |
| Bundle     | importable from the client too — it just loses caching and auto-auth there               | client only                                          |
| Transport  | `request` from `src/lib/fetcher.ts` (native `fetch`)                                     | `http` + `request` from `src/lib/http.ts` (axios)    |
| Why        | only `fetch` participates in the Next.js cache — `cache`, `next.revalidate`, `next.tags` | interceptors attach the session and normalize errors |
| Auth       | token passed explicitly via `GetArg` / `ListArg`                                         | attached by the request interceptor                  |
| Operations | **reads only**                                                                           | reads **and** `create` / `update` / `delete`         |

Mutations are client-scoped. A Server Component that needs to write does it through a Server Action or a Route Handler, not through a server service.

Both transports throw the same `ApiError` from `src/lib/api-error.ts`.

Hard rules:

- **Prisma is imported only from `src/lib/db.ts`.** Never `new PrismaClient()` anywhere else, never import from `@generated/prisma` outside `db.ts`.
- **Components never touch the database.** No `db` import in anything under `src/components` or in a page/layout that will render client-side.
- **Components never call axios or `fetch` directly.** Client components go through a query hook → client service. Server components call the server service.
- **Query hooks import client services only.** Neither transport is bundle-restricted, so nothing stops you importing a `*.service.ts` from a hook — it is still wrong: the fetch transport attaches no session and its cache options do nothing in the browser, so the call silently loses auth.
- **Route Handlers never import a service.** That would make the API call itself over HTTP.
- **`process.env` is read only in `src/lib/env.ts`.** Everything else imports `serverEnv` / `clientEnv`.
- **axios is instantiated only in `src/lib/http.ts`; raw `fetch` against the API only in `src/lib/fetcher.ts`.**

Working reference implementations of every layer already exist — copy their shape:
`src/app/api/health/route.ts`, `src/services/health.service.ts`, `src/services/health.service.client.ts`,
`src/hooks/queries/use-health-query.ts`, and the two specs in `src/services/__tests__/`.

## Where files live

| Path                  | Holds                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/app`             | routes, layouts, Route Handlers, `actions.ts`. **No stylesheets, no providers**                                                  |
| `src/styles`          | all CSS. `globals.css` is the Tailwind 4 CSS-first config — there is no `tailwind.config.js`                                     |
| `src/components`      | UI. `ui/` is shadcn-generated, `<feature>/` is ours                                                                              |
| `src/providers`       | React context providers. `root-layout-provider.tsx` composes them all                                                            |
| `src/hooks/queries`   | `use-<resource>-query.ts` — one file per resource, all its read hooks                                                            |
| `src/hooks/mutations` | `use-<resource>-mutation.ts` — one file per resource, all its write hooks                                                        |
| `src/lib`             | cross-cutting infrastructure: `db`, `env`, `http`, `fetcher`, `api-error`, `api-response`, `query-keys`, `utils`, `validations/` |
| `src/services`        | one server + one client service per entity, plus `types.ts`                                                                      |
| `src/types`           | ambient/global `.d.ts` — module augmentation, untyped-package declarations. **Not** entity types                                 |
| `src/test`            | MSW server and handlers                                                                                                          |
| `prisma`              | schema and migrations                                                                                                            |
| `generated/prisma`    | Prisma client output at the **project root**, outside `src`, reached via the `@generated/*` alias. Gitignored                    |
| `e2e`                 | Playwright specs                                                                                                                 |

Naming: files are kebab-case; hooks are `use-<resource>-<query\|mutation>.ts`; services are `<resource>.service.ts` / `<resource>.service.client.ts`.

**Providers**: `src/app/layout.tsx` mounts exactly one — `RootLayoutProvider`. Every new app-wide provider composes inside it, so the layout never becomes a nesting pyramid.

**Query keys**: `src/lib/query-keys.ts` holds every key and nothing else — no filtering helpers, no transport concerns.

A key carries only what changes the result — pagination, search, an id. **Never `token`, never `cache`.** Those change how a request is made, not which rows come back; keying on them splits the cache between callers holding identical data and strands entries whenever a token rotates. List keys are therefore typed `ListFilters` (`ListArg` minus `token` and `cache`), so the hook destructures before it builds a key:

```ts
const { token, cache, ...filters } = arg;
useQuery({
  queryKey: queryKeys.leads.list(filters), // filters only
  queryFn: () => leadClientService.list(arg), // service gets the whole arg
});
```

## Server Actions policy

Route Handlers are the API. Server Actions are **not** the default mutation path in this project.

Use a Server Action only when the point of the call is cache invalidation — `revalidatePath` or `revalidateTag` after a mutation. Put it in an `actions.ts` file next to the route that owns it, and have it call the API or the service layer's server-side equivalent, not Prisma directly if a handler already exists.

Everything else — create, update, delete, list, fetch — is a Route Handler under `src/app/api`, called from a service.

## Validation policy

- zod schemas live in `src/lib/validations/<resource>.ts` and are used **twice**: `schema.safeParse(await request.json())` in the Route Handler, and `zodResolver(schema)` in the form. One declaration guards both edges.
- On a failed parse, return `failValidation(parsed.error)` from `src/lib/api-response.ts` — it produces a 422 whose `errors` map (field path → messages) reaches the form unchanged through `ApiError.errors`.
- **Entity types are hand-written in `src/services/types.ts`.** Do not derive them with `z.infer` and do not re-export Prisma model types. Schemas describe _input payloads_; `types.ts` describes _entities as the client sees them_ (dates are ISO `string`, not `Date`).

## API response envelope

Every Route Handler returns this shape, and nothing else:

```ts
type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T | null;
  errors?: Record<string, string[]>; // field path → messages
};
```

Build it with the helpers in `src/lib/api-response.ts` — `ok`, `created`, `fail`, `failValidation`, `notFound`, `unauthorized`, `forbidden`, `serverError`. Never construct a `NextResponse.json` by hand.

- `errors` is keyed by dotted field path (`"contact.email"`); form-level problems collect under `_`. It is omitted entirely when nothing failed validation. `failValidation(parsed.error)` builds it from the zod issues.
- Both transports turn any `success: false` — whatever the HTTP status — into an `ApiError` (`src/lib/api-error.ts`) carrying `status`, `message`, and `errors`, which drops straight into react-hook-form's `setError`.
- Both sides call a function named `request()` to unwrap `data` — from `src/lib/http.ts` on the client, from `src/lib/fetcher.ts` on the server — so services return plain entities and never see the envelope. The import path is what tells you which transport you are on.

## Next.js 16 gotchas

Things stale training data gets wrong here:

- `middleware.ts` no longer exists. Middleware was renamed **Proxy**: a single `proxy.ts` at the project root (same level as `src/app`). See `docs/01-app/01-getting-started/16-proxy.md`.
- `params` and `searchParams` are **Promises** and must be awaited.
- Typed route props are global: `LayoutProps<"/">`, `PageProps<"/leads/[id]">` — see `src/app/layout.tsx`.
- API route files are `route.ts` with exported HTTP-method functions.
- `next dev` writes its PID/port to `.next/dev/lock`; a second `next dev` prints the running server instead of starting a duplicate. Reuse the running one.

## Prisma 7 gotchas

- `schema.prisma` has **no `url`** in the datasource. The CLI reads it from `prisma.config.ts`; the runtime gets it from the `PrismaPg` adapter in `src/lib/db.ts`.
- Prisma no longer auto-loads `.env` — `prisma.config.ts` imports `dotenv/config`.
- The client is generated into `/generated/prisma` at the project root, not `node_modules`. Import it as `@generated/prisma/client`. After any schema edit: `npm run db:generate`.

## Auth (deferred)

Not implemented yet. When it lands:

- session/route protection goes in a root-level `proxy.ts` (**not** `middleware.ts`);
- on the client the token attaches in the request interceptor in `src/lib/http.ts`, where the `TODO(auth)` marker sits; on the server it is already threaded through `GetArg.token` / `ListArg.token` into `request` from `src/lib/fetcher.ts`;
- server-side session helpers go in `src/lib/auth.ts`.

Do not invent an auth scheme mid-feature. Ask.

## Commands

```
npm run dev           next dev
npm run verify        typecheck + lint + test   ← the gate
npm run typecheck     tsc --noEmit
npm run lint          eslint
npm run test          vitest run
npm run test:e2e      playwright test
npm run db:generate   regenerate the Prisma client
npm run db:migrate    create + apply a migration
npm run db:studio     Prisma Studio
```

## Definition of done

1. `npm run verify` passes.
2. New behavior has a test — service tests use MSW (`src/test/msw`), not axios mocks.
3. A user-visible flow has an e2e spec in `e2e/`.
4. New files sit in the layer the contract assigns them.

## Verification loop

Run `next dev` and verify against the running server rather than guessing. The `next-devtools` MCP server (see `.mcp.json`) exposes `get_compilation_issues` and `compile_route` — check compilation there instead of paying for a full `next build`. Browser-level checks go through the Playwright MCP server.

Browser console errors are forwarded into the `next dev` terminal output, so client-side failures are readable without opening DevTools.
