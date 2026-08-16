---
description: Install this kit's code-style rules into the current project's .claude/rules/, and scaffold an AGENTS.md if one is missing. Run once when adopting the kit in a new project.
---

# Install the kit into this project

The agents and commands in this plugin reference `.claude/rules/*.md` by path. Rules only auto-load
from a project's own `.claude/rules/`, so they must be copied in — the plugin ships them as payload
rather than loading them itself.

## 1. Find the plugin root

You need the directory containing this plugin's `rules/` and `bin/`. Locate it by globbing for a
`nextjs-frontend-kit` directory that contains `bin/init-rules.mjs`, checking, in order:

- the path passed to `--plugin-dir`, if this session was started that way;
- the plugin cache under the user's home directory (`~/.claude/plugins/**/nextjs-frontend-kit*/bin/init-rules.mjs`).

If you cannot find it, say so and stop — do not hand-write the rule files from memory.

## 2. Install the rules

```bash
node "<plugin-root>/bin/init-rules.mjs"
```

It copies every `rules/*.md` into `./.claude/rules/`, skipping files that already exist. Report exactly what it wrote and what it left alone. Pass `--force` only if the user explicitly asks to overwrite their existing rules.

## 3. Check for AGENTS.md

If the project has no `AGENTS.md`, copy `<plugin-root>/templates/AGENTS.md` to the project root and tell the user it is a template with placeholders to fill in — the project name, description, and any layer paths that differ.

If `AGENTS.md` already exists, do not touch it. Instead read it and report which parts of the kit's contract it is missing, if any.

Also ensure `CLAUDE.md` exists containing the single line `@AGENTS.md`.

## 4. Report what still needs doing by hand

The plugin cannot ship these — list whichever apply:

- **Permissions.** A plugin's `settings.json` supports only `agent` and `subagentStatusLine`, so the allow/ask/deny lists do not travel. Offer to write a `.claude/settings.json` covering the project's npm scripts.
- **Stack mismatch.** The rules assume Next.js App Router, TanStack Query, zod, and Vitest + MSW against a separate backend API. Name anything the project does not use, because those rules will mislead the agents.
- **Layer paths.** The agents guard `src/components/**`, `src/app/**`, `src/lib/validations/**` and so on. If the project's layout differs, the scope lines need editing.
- **Auth scheme.** If the project has no auth yet, or uses something other than a session-cookie route gate, the auth-related lines in `frontend.md` and `ui-builder.md` need adjusting rather than followed as written.
