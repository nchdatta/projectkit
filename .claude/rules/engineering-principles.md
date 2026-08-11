# Engineering principles

Essential, must-follow. Applies to every file, every layer. This file grows — new rules get appended below, existing ones only change on explicit instruction.

These are tie-breakers, not licences to restructure. When a principle here disagrees with the layering contract in `AGENTS.md`, the contract wins.

## DRY — one declaration per fact

- Business logic, validation, and API shapes are declared once. A zod schema guards the handler and the form; a query key lives in `query-keys.ts`; an entity type lives in `services/types.ts`.
- Copy-paste is the signal, not the crime — extract on the **second** real duplication, not the first anticipated one.
- Before writing a helper, grep `src/lib`, `src/hooks`, `src/components/ui` for one that exists.
- Two things that merely look alike are not duplication. Do not merge a lead form and a customer form into a config-driven mega-component because they share five fields.

## Single responsibility

A file does one job at one layer. A component renders, a hook wires cache to service, a service speaks HTTP, a handler validates and queries. A component that also builds a URL is doing two jobs.

Formatting (dates, currency, labels) is presentation — it belongs in the component layer, never baked into a service or a handler response.

## Extend by composition

Add a wrapper, not another `variant` branch in a stable component every time a caller differs.

## Narrow types at the point of use

`ListFilters` over `ListArg` when only filters matter; a prop object of exactly what the component reads, not the whole entity when it renders a name.

## KISS — simplest thing that satisfies the requirement

- No abstraction, context, generic, or state library until concrete duplication or a concrete bug demands it.
- Prefer a plain function to a class, a prop to a context, a derived value to state.
- If explaining the design takes longer than the feature, the design is wrong.

## YAGNI — build what is asked

- No speculative options, config flags, `extra?: unknown` escape hatches, or "we'll need pagination later" parameters.
- No endpoints, fields, or hooks with no caller in the same change.
- A new package needs a reason the existing stack cannot cover.

## Type safety

- No `any`. No `as` to silence a real mismatch — narrow, or fix the type. `unknown` plus a parse is the escape hatch.
- Types are explicit at boundaries — props, service signatures, handler return shape. Inside a function body, inference is fine.

## Trust nothing from outside

Every external input is parsed with zod server-side before use: request bodies, `searchParams`, route `params`, Server Action arguments. Client-side validation is UX only.
