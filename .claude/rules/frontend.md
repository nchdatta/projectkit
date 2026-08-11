# Frontend code style

Basic rules. This file grows — new rules get appended below, existing ones only change on explicit instruction.

## Component files

- One component per file. Filename kebab-case, matches the component in PascalCase: `lead-card.tsx` → `LeadCard`.
- `src/components/ui/**` is shadcn-generated and exempt — do not hand-edit it to match these rules; regenerate through the shadcn CLI instead.

## Component definition

Arrow function assigned to a `const`, props typed by an interface declared directly above it, default-exported on its own line at the **bottom** of the file — never `export default function` and never an inline default on the const itself.

```tsx
interface LeadCardProps {
  lead: Lead;
  onSelect?: (id: string) => void;
}

const LeadCard = ({ lead, onSelect }: LeadCardProps) => {
  return <div>{lead.name}</div>;
};

export default LeadCard;
```

Exception: Next.js file-convention components (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`) follow the same arrow-function-then-default-export shape, but the export name matches Next's convention (`Home`, `RootLayout`, …) rather than the filename.

## File layout, top to bottom

1. `"use client"` directive, if the file needs one — first line, blank line after.
2. Imports: external packages, then `@/` internal, then relative — each group separated by a blank line, matching the existing files in this repo.
3. Local types/interfaces (the component's own `Props`, nothing entity-shaped — those come from `@/services/types`).
4. Local constants/helpers used only by this component.
5. The component.
6. `export default` — the last line.

## Props

- Destructure in the function signature, not with `props.x` inside the body.
- Type every prop explicitly. No `any`.
- `children`: type it `ReactNode`, imported from `"react"`.

## Data and state

- Server Components by default; `"use client"` only when the file needs state, effects, handlers, or a browser API — see `AGENTS.md` for the full rule.
- Data comes from `src/hooks/queries` / `src/hooks/mutations` — never a service or `fetch`/axios directly.
- The React Compiler is on. Do not hand-write `useMemo`, `useCallback`, or `memo`.

## JSX and handlers

- Extract non-trivial event logic to a named function (`handleSubmit`, `handleSelect`) declared above the `return`; don't inline multi-line arrow functions in JSX props.
- Conditional classes go through `cn()` from `@/lib/utils`. Let `prettier-plugin-tailwindcss` own class order — don't hand-sort utility classes.
