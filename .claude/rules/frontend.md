# Frontend code style

Essential, must-follow. This file grows — new rules get appended below, existing ones only change on explicit instruction.

## Comments

One line, max. State the non-obvious why, not the what.

## Component definition

Arrow function assigned to a `const`, props typed by an interface declared directly above it, default-exported on its own line at the bottom — never `export default function`, never an inline default on the const.

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

## Props

Destructure in the function signature. Type every prop explicitly — no `any`. Type `children` as `ReactNode`.

## Server Components by default

Add `"use client"` only when the file needs state, effects, event handlers, or a browser API.

## Push `"use client"` down, never up

The directive is contagious — every import below a client component becomes client too. Put it on the smallest leaf that needs interactivity, not on the page or layout that contains it. A page with one interactive filter bar stays a Server Component and renders `<FilterBar />` as a client child.

Pass server-fetched data down as props instead of making the parent client so it can fetch.

## Fetch on the server when the data is not interactive

Static or first-paint data comes from a Server Component through the server service. Reach for a query hook when the data is user-driven — refetching, mutation-invalidated, paginated by a control, or polled. Do not render an empty client shell that immediately fetches what the server already knew.

## Render is pure

No mutation, no fetching, no subscriptions, no `localStorage`, no DOM reads during render. Effects are for synchronizing with something outside React — not for deriving values, and not for reacting to a prop change that a plain expression could compute.

## State is minimal

- Never store what you can derive from props, existing state, or the URL.
- Local `useState` by default; lift only when a second component genuinely needs it; context only for app-wide concerns, mounted through `root-layout-provider.tsx`.
- Server data lives in TanStack Query, not copied into `useState`.
- Filters, tabs, and pagination that should survive a reload belong in `searchParams`, not state.

## React rules

- Hooks at the top level of the component or another hook — never in a condition, loop, or callback.
- Keys are stable and unique to the item (`lead.id`), never the array index.
- No hand-written `useMemo` / `useCallback` / `memo` — the React Compiler is on and adding them is noise.

## Use the framework primitives

`next/link` for internal navigation (never a bare `<a>`), `next/image` for images, the Metadata API for titles and tags, `next/font` for fonts. Reach for a third-party equivalent only when the built-in cannot do the job.

## Styling

Tailwind utilities in the JSX; `cn()` from `src/lib/utils` to merge conditional classes. No inline `style` objects except for genuinely dynamic values, no CSS modules, no stylesheet outside `src/styles`.
