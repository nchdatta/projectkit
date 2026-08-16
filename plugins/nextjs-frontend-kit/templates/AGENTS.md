# <Project> — frontend guide

<!-- One line: what this app is. -->

Frontend only: a Next.js App Router client for a separate backend API reached through
`NEXT_PUBLIC_API_BASE_URL`. Business logic lives in that backend. This file is the contract;
`.claude/rules/*.md` is the mechanical detail underneath it. When they disagree, this file wins.

## Scope boundaries

**In scope:** routes, layouts, components, client state, forms and validation, styling,
accessibility, data fetching against the backend API, tests.

**Out of scope — do not add:** route handlers under `src/app/api/**` <!-- name any real exception,
e.g. the NextAuth handler --> ; databases, ORMs, migrations, queues, schedulers, webhook receivers,
third-party SDKs; business rules the backend owns — the frontend renders backend decisions; Server
Actions that mutate — `src/lib/actions.ts` is cache invalidation and nothing else, and a Server
Action is a public endpoint.

If a task needs backend work, build against the expected response shape, stub it with MSW in
`src/test/msw/handlers.ts`, and say what the backend must provide.

## Commands

```bash
npm run dev / build       # dev server, production build
npm run lint / typecheck  # eslint, tsc --noEmit
npm run format            # prettier --write .
npm test / test:e2e       # vitest run, playwright
npm run verify            # typecheck + lint + test — the done-gate
```

Done means `npm run verify` passes. npm only — no pnpm, yarn, or bun. Install with `@latest`; never
pin a version from memory.

## Stack

Next.js 16 App Router, React 19.2 with the **React Compiler on** (`reactCompiler: true` in
`next.config.ts` — never hand-write `useMemo`/`useCallback`/`memo`), TypeScript `strict` with `@/*`
→ `src/*`, Tailwind v4 CSS-first + shadcn/ui, TanStack Query 5, react-hook-form + zod 4, Vitest +
Testing Library + MSW, Playwright.
<!-- Add or remove: auth library, icon set, UI primitives layer (Base UI / Radix), font provider. -->

## Directory layout

Preserve this layout and its naming. Files are kebab-case; one component per file.

```
e2e/                             Playwright specs
src/
├── app/                         routes and layouts only
│   ├── (storefront)/            public marketing + auth (no URL segment)
│   ├── app/                     authenticated surface
│   └── api/...                  route handlers — only the stated exception(s)
├── components/{app,storefront,providers,ui,shared}/
├── lib/       actions.ts (revalidate only), cache-tags.ts, fonts.ts, query-client.ts,
│              utils.ts, validations/<resource>.ts
├── proxy.ts   route gate (Next 16 middleware)
├── styles/globals.css, test/ (Vitest setup, MSW), types/
```

Components are grouped by surface, not by type. `app/` and `storefront/` never import from each
other; a shared primitive belongs in `ui/`, generated via `npx shadcn@latest add` and never
hand-edited.

## Routing and auth

<!-- Describe the route gate: which file, how a new protected prefix is added, whether auth is
implemented yet or deferred. If deferred, say plainly that agents must ask rather than invent a
scheme. -->

[src/proxy.ts](src/proxy.ts) is the **single route gate**. Layouts and pages never guard
themselves directly. Client components read the session via the project's session hook; sign
in/out go through its client helpers.

## State, forms, styling, tests

State tiers, in order: Server Components → TanStack Query (`getQueryClient()`, a sensible
`staleTime`) → `useState` → URL state. No global store. `useSearchParams` needs a `<Suspense>`
boundary. Providers compose inside a single root provider component, never in `src/app/layout.tsx`.
Forms: `useForm` + `zodResolver`, `noValidate`, schemas from `src/lib/validations/`. Style with
semantic tokens and `cn()`, never raw color values; fonts live in `src/lib/fonts.ts`. Vitest runs
`src/**/*.{test,spec}.{ts,tsx}` with MSW on `onUnhandledRequest: 'error'` — stub backend calls with
a handler, never by mocking `fetch`. `.env*` is gitignored except `.env.example`; only
`NEXT_PUBLIC_*` reaches the browser.

Full mechanics: [frontend.md](.claude/rules/frontend.md),
[engineering-principles.md](.claude/rules/engineering-principles.md),
[react-performance.md](.claude/rules/react-performance.md).

## Agent configuration

```
.claude/
├── settings.json   permission allowlist + prettier PostToolUse hook
├── rules/          frontend.md, engineering-principles.md, react-performance.md
├── agents/         ui-builder.md (components + routes), test-author.md (specs only),
│                   frontend-reviewer.md (read-only review)
├── commands/       verify.md, review.md
└── hooks/          format.mjs
```

Intentionally **no `skills/`** and no backend-shaped agents, commands, or rules — nothing for
schema modelling, migrations, route handlers, or a service layer. `CLAUDE.md` imports this file.
New cross-cutting guidance goes here, new mechanical detail in the matching rule file.
`.claude/settings.local.json` is gitignored for personal overrides.
