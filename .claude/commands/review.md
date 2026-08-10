---
description: Review the working diff against Flowly's layering contract
allowed-tools: Bash(git status), Bash(git diff:*), Bash(git log:*), Read, Grep, Glob
---

Review the current diff (`git diff` plus untracked files from `git status`) against the rules in `AGENTS.md`.

Scope: **$ARGUMENTS** (default: everything uncommitted).

Check for these violations specifically — they are the ways this architecture rots:

**Layering**

- `db` or `@/generated/prisma` imported anywhere except `src/lib/db.ts`
- `new PrismaClient()` outside `src/lib/db.ts`
- a component or page importing `db`, axios, or calling `fetch` directly
- a Route Handler importing from `src/services`
- a query hook containing a URL or axios call
- `process.env` read outside `src/lib/env.ts`

**Contracts**

- entity types derived with `z.infer` or re-exported from Prisma instead of declared in `src/services/types.ts`
- a Route Handler returning bare `NextResponse.json` instead of the `api-response` helpers, or a response missing any of `success` / `status` / `message` / `data` / `errors`
- a validation failure not returned through `failValidation` (so the form loses its field errors)
- a hand-written query key array instead of `keys.ts`

**Next.js 16**

- a `middleware.ts` file (it is `proxy.ts` now)
- `params` or `searchParams` used without `await`
- a Server Action doing work other than `revalidatePath`/`revalidateTag`
- hand-added `useMemo`/`useCallback`/`memo` (the React Compiler is on)

**Coverage**

- new service without an MSW-backed test
- new user-visible flow without an e2e spec

Report one line per finding: `path:line — problem. Fix.` Severity first. No praise, no restating what the diff does. If nothing is wrong, say so in one line.
