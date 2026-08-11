---
description: Review the working diff against Flowly's layering contract
allowed-tools: Bash(git status), Bash(git diff:*), Bash(git log:*), Read, Grep, Glob
---

Review the current diff (`git diff` plus untracked files from `git status`). Scope: **$ARGUMENTS** (default: everything uncommitted).

The rules are in `AGENTS.md` and `.claude/rules/*.md` — read them, do not review from memory. They are authoritative; this file only says how to hunt.

## 1. Mechanical checks — grep the diff, these are never judgment calls

| Grep for                                         | Violation unless the file is                              |
| ------------------------------------------------ | --------------------------------------------------------- |
| `@generated/prisma`, `new PrismaClient(`         | `src/lib/db.ts`                                           |
| `from "@/lib/db"`                                | a Route Handler                                           |
| `process.env`                                    | `src/lib/env.ts`                                          |
| `from "axios"`                                   | `src/lib/http.ts`                                         |
| `fetch(` against the API                         | `src/lib/fetcher.ts`                                      |
| `from "@/services`                               | anything outside `src/app/api`                            |
| `NextResponse.json`                              | never — use the `api-response` helpers                    |
| `z.infer`, `import type { .* } from "@generated` | never — types are hand-written in `src/services/types.ts` |
| `useMemo`, `useCallback`, `memo(`                | never — the React Compiler is on                          |
| `middleware.ts`                                  | never — it is `proxy.ts` now                              |
| `queryKey: [`                                    | never — keys come from `src/lib/query-keys.ts`            |

Also flag by filename: a component outside `src/components/{dashboard,storefront,shared,ui}/`, a `dashboard/` file importing from `storefront/` or the reverse, a hand-edit to `src/components/ui/`, a stylesheet outside `src/styles`, a hook not named `use-<resource>-<query\|mutation>.ts`, a mutation hook in `queries/`, an entity type in `src/types`, a provider mounted in `layout.tsx` instead of `root-layout-provider.tsx`.

## 2. Judgment checks — read the changed files

- **Layering** — a component reaching past its hook; a query hook importing a `*.service.ts` instead of the client one; a Server Action doing anything but `revalidatePath`/`revalidateTag`, or doing it with no auth check inside the action.
- **Contracts** — `params`/`searchParams` used without `await`; a validation failure not returned through `failValidation`; a query key carrying `token` or `cache`; a `try/catch` around more than the Prisma call.
- **Database** — a camelCase Prisma field, or `@map` faking snake_case; a model missing `@@map`; an unindexed foreign key; a hard `.delete()` on a CRM entity.
- **Style** — a component that is not an arrow const, or whose `export default` is not the last line; a Route Handler exported as an arrow instead of `export async function METHOD`; a multi-line comment.
- **Performance** — sequential `await`s on independent work; a Server Component awaiting its own data before children that could fetch in parallel; one slow fetch blocking a whole return instead of a `<Suspense>` boundary; a heavy component imported eagerly or through a barrel `index.ts`; a component defined inside another component's body.
- **Principles** — the same logic, type, or validation rule declared twice; an abstraction with exactly one caller; a field, endpoint, or prop with no caller in this diff; `any` or an `as` papering over a mismatch; external input used without a zod parse; a component doing two jobs; `"use client"` on a page when only a leaf needs it; state holding a derivable value or a copy of server data; a side effect during render; an array index as a key; a bare `<a>` or `<img>`.
- **Coverage** — a new service without an MSW-backed test; a new user-visible flow without an e2e spec.

## 3. Report

One line per finding: `path:line — problem. Fix.` Severity first. No praise, no restating what the diff does. If nothing is wrong, say so in one line.
