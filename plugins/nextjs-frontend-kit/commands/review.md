---
description: Review the working diff against this repository's frontend scope and conventions
allowed-tools: Bash(git status), Bash(git diff:*), Bash(git log:*), Read, Grep, Glob
---

Review the current diff (`git diff` plus untracked files from `git status`). Scope:
**$ARGUMENTS** (default: everything uncommitted).

The rules are in `AGENTS.md` and `.claude/rules/*.md` — read them, do not review from memory. They
are authoritative; this file only says how to hunt.

## 1. Mechanical checks — grep the diff, these are never judgment calls

| Grep for                                | Violation unless the file is                                          |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| a new `route.ts` under `src/app/api/`   | never, unless `AGENTS.md` names an explicit exception (e.g. auth)     |
| `'use server'`                          | the cache-invalidation `actions.ts`, and only for `revalidatePath`/`Tag` |
| `process.env`                           | auth config, `next.config.ts`, `src/proxy.ts`                          |
| `useMemo`, `useCallback`, `memo(`       | never — the React Compiler is on                                       |
| `middleware.ts`                         | never — it is `proxy.ts` now                                           |
| auth check in a `page.tsx` / `layout.tsx` | never — `src/proxy.ts` is the single route gate                      |
| `#[0-9a-f]{3,6}`, `oklch(`, `dark:bg-`  | `src/styles/globals.css` — components use semantic tokens              |
| `tailwind.config`                       | never — Tailwind v4 is configured in CSS                               |
| `next/font` import                      | `src/lib/fonts.ts`                                                     |
| `vi.mock` of `fetch` or an HTTP module  | never — backend calls are stubbed with MSW                             |
| a new dependency in `package.json`      | pinned from memory instead of installed with `@latest`                 |

Also flag by filename: a component outside `src/components/{app,storefront,providers,ui}/`, an
`app/` file importing from `storefront/` or the reverse, a hand-edit to `src/components/ui/`, a
non-kebab-case filename, two components in one file, a stylesheet outside `src/styles`, a zod
schema outside `src/lib/validations/`, a provider mounted in `src/app/layout.tsx` instead of the
root provider component, a new env var missing from `.env.example`, a secret in a `NEXT_PUBLIC_*`
name.

## 2. Judgment checks — read the changed files

- **Scope** — anything that belongs to the backend: a database or ORM call, a queue, a scheduler, a
  webhook receiver, a third-party SDK, or a business rule implemented in the frontend rather than
  rendered from a backend response.
- **Contracts** — `params`/`searchParams` used without `await`; a route prop typed by hand instead
  of `PageProps` / `LayoutProps`; `useSearchParams` without a `<Suspense>` boundary; an auth error
  message that reveals whether an account exists.
- **Style** — a component that is not an arrow const, or whose `export default` is not the last
  line; a props interface not directly above the component; a generated `ui/` primitive reformatted
  to the app style; a multi-line comment.
- **Performance** — sequential `await`s on independent work; a Server Component awaiting its own
  data before children that could fetch in parallel; one slow fetch blocking a whole return instead
  of a `<Suspense>` boundary; a heavy component imported eagerly or through a barrel `index.ts`; a
  component defined inside another component's body; `'use client'` on a page when only a leaf
  needs it.
- **Principles** — the same validation rule or type declared twice; an abstraction with exactly one
  caller; a prop with no caller in this diff; `any` or an `as` papering over a mismatch; a
  component doing two jobs; state holding a derivable value or a copy of server data; a side effect
  during render; an array index as a key; a bare `<a>` or `<img>`; a query missing its loading,
  error, or empty state.
- **Coverage** — a new user-visible flow with no e2e spec; a new component with backend-dependent
  behavior and no MSW-backed test.

## 3. Report

One line per finding: `path:line — problem. Fix.` Severity first. No praise, no restating what the
diff does. If nothing is wrong, say so in one line.
