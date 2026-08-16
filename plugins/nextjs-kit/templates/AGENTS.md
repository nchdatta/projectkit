# <Project>

<!-- One line: what this app is. -->

Single Next.js app, fullstack.

| Layer        | Choice                                | Notes                                                       |
| ------------ | ------------------------------------- | ----------------------------------------------------------- |
| Framework    | Next.js 16, App Router                | Docs at `node_modules/next/dist/docs/` — read them          |
| UI           | React 19 + React Compiler             | Compiler **on** — never hand-write `useMemo`/`useCallback`  |
| Styling      | Tailwind CSS 4 + shadcn/ui            | CSS-first config in `src/styles/globals.css`, no JS config  |
| Data         | Prisma 7 + PostgreSQL                 | Client generated to `@generated/prisma`                     |
| Transport    | axios (client) / `fetch` (server)     | `src/lib/http.ts`, `src/lib/fetcher.ts` — both `request`    |
| Server state | TanStack Query 5                      | zod validation, react-hook-form + `@hookform/resolvers/zod` |
| Tests        | Vitest + MSW (unit), Playwright (e2e) | npm                                                         |

## Rules

Read `.claude/rules/engineering-principles.md` plus the file for the layer you are touching before writing code. Append-only: treat existing entries as settled unless told otherwise. On conflict, the layering contract below wins.

| File                        | Covers                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `engineering-principles.md` | DRY, single responsibility, composition, KISS, YAGNI, type safety, input trust                    |
| `frontend.md`               | component files, props, JSX, client/server split, state, styling                                  |
| `backend.md`                | route handler files, response style, error handling                                               |
| `database.md`               | Prisma model conventions, snake_case columns, indexes, migrations                                 |
| `react-performance.md`      | parallel async, RSC composition, Server Action auth, lazy loading, Suspense, no inline components |

**Comments are one line, max**, in code of any kind. State the non-obvious why.

## The layering contract

Every feature moves through the same files, in this order:

```
src/app/api/<resource>/route.ts                Route Handler — zod-parses input, calls Prisma, returns the envelope
src/lib/validations/<resource>.ts              zod schemas — shared by the handler and the form
src/services/types.ts                          entity types, GetArg / ListArg
src/services/<resource>.service.ts             SERVER service — fetch via lib/fetcher, cacheable, token passed in. Reads only, called by Server Components and by client read hooks alike
src/services/<resource>.service.client.ts      CLIENT service — axios, session + errors via interceptors. Writes only
src/lib/query-keys.ts                          every cache key, in one object
src/hooks/queries/use-<resource>-query.ts      read hooks
src/hooks/mutations/use-<resource>-mutation.ts write hooks
src/components/<area>/<module>/*.tsx           UI — area is dashboard | storefront | shared
src/app/**/actions.ts                          Server Actions — ONLY revalidatePath / revalidateTag
```

Dependencies run one way: **components → hooks → service → HTTP → route handlers → Prisma**. Read hooks and Server Components both call the server service; write (mutation) hooks call the client service. Mutations are client-scoped — a Server Component that writes goes through a Server Action or a Route Handler.

Hard rules:

- **Prisma is imported only from `src/lib/db.ts`.** Never `new PrismaClient()` elsewhere, never import `@generated/prisma` outside `db.ts`.
- **Components never touch the database, axios, or `fetch`.** Client components go through a query/mutation hook → service; Server Components call the server service directly.
- **Query hooks call the server service, mutation hooks call the client service** — reads reuse the server service's `fetch` transport (fine to call client-side, GET routes don't require the session), writes go through axios so the interceptor attaches the session and errors normalize to `ApiError`.
- **Route Handlers never import a service.** That would make the API call itself over HTTP.
- **`process.env` is read only in `src/lib/env.ts`.** Everything else imports `serverEnv` / `clientEnv`.
- **axios is instantiated only in `src/lib/http.ts`; raw `fetch` against the API only in `src/lib/fetcher.ts`.**
- **One zod schema per resource in `src/lib/validations/`, used twice** — `safeParse` in the handler, `zodResolver` in the form.
- **Every Route Handler returns `{ success, status, message, data, errors? }`** via a helper from `src/lib/api-response.ts` (`ok`, `created`, `fail`, `failValidation`, `notFound`, `unauthorized`, `forbidden`, `serverError`) — never a bare `NextResponse.json`. `errors` is keyed by dotted field path (`"contact.email"`), form-level under `_`; both transports turn any `success: false` into an `ApiError` that drops into react-hook-form's `setError`.
- **Entity types are hand-written in `src/services/types.ts`** — never `z.infer`, never re-exported Prisma types. Dates are ISO `string`.
- **Query keys carry only what changes the result** — never `token`, never `cache`. List keys are typed `ListFilters`, so hooks destructure those out before building a key.
- **Server Actions do cache invalidation only**, in an `actions.ts` beside the route that owns it. Everything else is a Route Handler.

<!-- Point at this project's reference implementations — the files a new layer should be copied from. -->

## Where files live

Files are kebab-case. `src/app` holds routes, layouts, Route Handlers and `actions.ts` — **no stylesheets, no providers**; all CSS is in `src/styles`, and `layout.tsx` mounts exactly one provider, `RootLayoutProvider`, which every other provider composes inside. `src/lib` is cross-cutting infrastructure only. `src/types` is ambient `.d.ts` — **not** entity types. MSW lives in `src/test`, Playwright specs in `e2e`, schema and migrations in `prisma`, and the generated Prisma client in `/generated/prisma` at the project root, gitignored.

Components are filed by app area, mirroring the route groups:

```
src/app/(dashboard)/items/page.tsx         route
src/components/dashboard/items/*.tsx       its components — the authenticated app
src/app/(storefront)/pricing/page.tsx      route
src/components/storefront/pricing/*.tsx    its components — marketing, auth, anything unauthed
src/components/shared/*.tsx                used by both areas, app-specific
src/components/ui/*.tsx                    shadcn-generated primitives — do not hand-edit
```

A component starts in the area that uses it and moves to `shared/` only when a second area needs it. Never import across areas: `dashboard/` and `storefront/` reach for `shared/` or `ui/`, never for each other.

## Gotchas your training data gets wrong

- `middleware.ts` no longer exists — it is `proxy.ts` at the project root.
- `params` and `searchParams` are **Promises** and must be awaited.
- Typed route props are global: `LayoutProps<"/">`, `PageProps<"/items/[id]">`.
- `schema.prisma` has **no `url`** — the CLI reads it from `prisma.config.ts`, the runtime from the `PrismaPg` adapter in `db.ts`. Prisma no longer auto-loads `.env`. After any schema edit: `npm run db:generate`.
- Auth: <!-- describe the scheme, or say it is deferred and that agents must ask rather than invent one -->

## Done means

`npm run verify` passes (typecheck + lint + test — the gate). New behavior has a test, services tested through MSW and not axios mocks. A user-visible flow has an e2e spec. New files sit in the layer the contract assigns them.
