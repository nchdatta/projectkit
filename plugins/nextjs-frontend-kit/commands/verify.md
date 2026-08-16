---
description: Run the full verification gate (typecheck + lint + tests) and report failures by gate
allowed-tools: Bash(npm run verify), Bash(npm run typecheck), Bash(npm run lint), Bash(npm run test), Bash(npm run test:e2e), Read, Grep, Glob, Edit
---

Run `npm run verify`. If it passes, say so in one line and stop.

If it fails:

1. Name the failing gate — typecheck, lint, or tests — and stop reading there, since `verify`
   short-circuits.
2. Quote the exact error output and point at the offending `path:line`.
3. Diagnose the cause, checking it against `AGENTS.md` and `.claude/rules/*.md`. A surprising
   number of failures here are a scope or convention violation: a route handler added outside the
   project's stated exception, a component importing across the `app/` ↔ `storefront/` line, a
   test hitting an unhandled request because no MSW handler exists, a page typed with a
   hand-written `{ children }` instead of `LayoutProps`.
4. Propose the fix. Apply it only if the user asked for `/verify --fix`, then re-run.

$ARGUMENTS
