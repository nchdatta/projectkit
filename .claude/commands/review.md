---
description: Review the working diff against Flowly's layering contract
allowed-tools: Bash(git status), Bash(git diff:*), Bash(git log:*), Read, Grep, Glob
---

Review the current diff (`git diff` plus untracked files from `git status`) against the rules in `AGENTS.md` and `.claude/rules/{engineering-principles,frontend,backend,database,react-performance}.md`.

Scope: **$ARGUMENTS** (default: everything uncommitted).

Check for these violations specifically — they are the ways this architecture rots:

**Layering**

- `db` or `@generated/prisma` imported anywhere except `src/lib/db.ts`
- `new PrismaClient()` outside `src/lib/db.ts`
- a component or page importing `db`, axios, or calling `fetch` directly
- a Route Handler importing from `src/services`
- a query hook containing a URL or axios call
- `process.env` read outside `src/lib/env.ts`

**Contracts**

- entity types derived with `z.infer` or re-exported from Prisma instead of declared in `src/services/types.ts`
- a Route Handler returning bare `NextResponse.json` instead of the `api-response` helpers, or a response missing any of `success` / `status` / `message` / `data` / `errors`
- a validation failure not returned through `failValidation` (so the form loses its field errors)
- a hand-written query key array instead of `src/lib/query-keys.ts`, or a key carrying a token / cache mode

**Next.js 16**

- a `middleware.ts` file (it is `proxy.ts` now)
- `params` or `searchParams` used without `await`
- a Server Action doing work other than `revalidatePath`/`revalidateTag`
- hand-added `useMemo`/`useCallback`/`memo` (the React Compiler is on)

**Structure**

- a stylesheet outside `src/styles`, or a provider mounted directly in `src/app/layout.tsx` instead of `root-layout-provider.tsx`
- a hook file not named `use-<resource>-query.ts` / `use-<resource>-mutation.ts`, or a mutation hook sitting in `queries/`
- an entity type declared in `src/types` instead of `src/services/types.ts`

**Database**

- a Prisma field written camelCase (`createdAt`) instead of snake_case directly (`created_at`), or a `@map` used to fake it instead of just naming the field snake_case
- a model missing `@@map("<snake_case_plural>")` for the table name
- a foreign key column with no index
- a hard `.delete()` on a CRM entity instead of a `deletedAt` soft delete

**Style**

- a component that is not an arrow function, or whose `export default` is not the last line of the file
- a Route Handler exported as an arrow function instead of `export async function METHOD`
- a `try/catch` in a Route Handler wrapped around more than the Prisma call

**Performance (must-follow)**

- sequential `await`s on independent operations instead of `Promise.all()`
- a Server Component awaiting its own data before rendering children that could fetch in parallel
- a Server Action with no auth check inside the action itself
- a heavy component imported eagerly (no `next/dynamic`) or pulled through a barrel `index.ts`
- an async Server Component blocking its whole return on one slow fetch instead of a `<Suspense>` boundary around it
- a component defined inside another component's function body

**Principles**

- logic, a type, or a validation rule declared in two places instead of one
- an abstraction, context, generic, or config flag with exactly one caller
- a field, endpoint, prop, or parameter added with no caller in this diff
- `any`, or an `as` cast papering over a real type mismatch
- external input (body, `searchParams`, `params`, Server Action args) used without a zod parse
- a component doing two jobs — rendering plus building a URL, formatting inside a service, business rules in JSX
- `"use client"` on a page or layout when only a leaf needs it
- state holding a value derivable from props, other state, or the URL; server data copied into `useState`
- a side effect during render, or an effect used to derive a value
- an array index used as a key
- a bare `<a>` for internal navigation, or `<img>` instead of `next/image`

**Coverage**

- new service without an MSW-backed test
- new user-visible flow without an e2e spec

Report one line per finding: `path:line — problem. Fix.` Severity first. No praise, no restating what the diff does. If nothing is wrong, say so in one line.
