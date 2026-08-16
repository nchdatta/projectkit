# Engineering principles

Must-follow, every file. Append-only — existing entries change only on explicit instruction. These
are tie-breakers, not licences to restructure: when one disagrees with the scope boundaries in
`AGENTS.md`, `AGENTS.md` wins.

## DRY — one declaration per fact

Validation rules and API shapes are declared once: a zod schema in `src/lib/validations/` guards
the form (and any auth `authorize` callback), a cache tag lives in `src/lib/cache-tags.ts`. Before
writing a helper, grep `src/lib`, `src/components/ui` for one that exists.

Copy-paste is the signal, not the crime — extract on the **second** real duplication, not the first
anticipated one. Two things that merely look alike are not duplication: do not merge two different
resources' forms into a config-driven mega-component because they share five fields.

## Single responsibility

A file does one job. A component renders, a hook wires cache to the API, a schema validates.
A component that also builds a URL is doing two jobs. Formatting — dates, currency, labels — is
presentation and belongs in the component layer.

## Composition and narrow types

Extend by wrapping, not by adding another `variant` branch to a stable component every time a
caller differs. Type at the point of use: a prop object of exactly what the component reads rather
than the whole entity when it renders a name.

## KISS

- No abstraction, context, generic, or state library until concrete duplication or a concrete bug
  demands it.
- Prefer a plain function to a class, a prop to a context, a derived value to state.
- If explaining the design takes longer than the feature, the design is wrong.

## YAGNI

- No speculative options, config flags, `extra?: unknown` escape hatches, or "we'll need pagination
  later" parameters.
- No components, fields, or hooks with no caller in the same change.
- A new package needs a reason the existing stack cannot cover. Install with `@latest`; never pin a
  version from memory, and npm only — no pnpm, yarn, or bun.

## Type safety and input trust

No `any`. No `as` to silence a real mismatch — narrow, or fix the type; `unknown` plus a parse is
the escape hatch. Types are explicit at boundaries (props, hook signatures, API response shapes);
inference inside a function body is fine.

Client-side validation is UX, not a security control — the backend re-validates. Never assume a
response matches its declared type without parsing when the shape is not yours to control, and
never put a secret in a `NEXT_PUBLIC_*` variable.

## Backend work does not happen here

If a task needs an endpoint that does not exist, build the UI against the expected response shape,
stub it with MSW in `src/test/msw/handlers.ts`, and say plainly what the backend must provide. Do
not add a route handler, a database client, a queue, a webhook receiver, or a business rule to
close the gap.
