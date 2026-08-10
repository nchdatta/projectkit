---
description: Run the full verification gate (typecheck + lint + tests) and report failures by gate
allowed-tools: Bash(npm run verify), Bash(npm run typecheck), Bash(npm run lint), Bash(npm run test), Bash(npm run test:e2e), Read, Grep, Glob, Edit
---

Run `npm run verify`.

If it passes, say so in one line and stop.

If it fails:

1. Say which gate failed — typecheck, lint, or tests — and stop reading at the first failing gate, since `verify` short-circuits.
2. Quote the exact error output.
3. Point at the offending file with a `path:line` reference.
4. Diagnose the cause. Check it against the layering contract in `AGENTS.md` — a surprising number of failures here are a layer violation (a component importing `db`, a service importing Prisma types, an entity typed with `z.infer`).
5. Propose the fix. Apply it only if the user asked for `/verify --fix`, then re-run.

$ARGUMENTS
