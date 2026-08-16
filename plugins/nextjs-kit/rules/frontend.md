# Frontend code style

Must-follow. Append-only — existing entries change only on explicit instruction.

## Component definition

Arrow function assigned to a `const`, props typed by an interface directly above it, default export on its own line at the bottom. Never `export default function`, never an inline default on the const. Destructure props in the signature, type every one explicitly — no `any`, `children` is `ReactNode`.

```tsx
interface ItemCardProps {
  item: Item;
  onSelect?: (id: string) => void;
}

const ItemCard = ({ item, onSelect }: ItemCardProps) => {
  return <div>{item.name}</div>;
};

export default ItemCard;
```

## Where a component goes

`src/components/<area>/<module>/<component>.tsx`, where area is `dashboard` (the authenticated app), `storefront` (marketing, auth, anything unauthed), or `shared` (both). `ui/` is shadcn output — regenerate it, never hand-edit it.

The module folder matches the route it serves, not the entity it renders: an item table used on the reports screen lives in `dashboard/reports/`. Promote to `shared/` only when a second area actually imports it — one duplicated component is cheaper than a wrong abstraction. `dashboard/` and `storefront/` never import from each other.

## Server Components by default

`"use client"` only when the file needs state, effects, event handlers, or a browser API — and then on the smallest leaf that needs it. The directive is contagious: every import below a client component becomes client too. A page with one interactive filter bar stays a Server Component and renders `<FilterBar />` as a client child. Pass server-fetched data down as props rather than making the parent client so it can fetch.

Static and first-paint data comes from a Server Component through the server service. A query hook is for user-driven data — refetching, mutation-invalidated, paginated by a control, polled. Never render an empty client shell that immediately fetches what the server already knew.

## Render is pure

No mutation, fetching, subscriptions, `localStorage`, or DOM reads during render. Effects synchronize with something outside React — they do not derive values, and they do not react to a prop change a plain expression could compute.

## State is minimal

- Never store what you can derive from props, existing state, or the URL.
- Local `useState` by default; lift only when a second component needs it; context only for app-wide concerns, mounted through `root-layout-provider.tsx`.
- Server data lives in TanStack Query, never copied into `useState`.
- Filters, tabs, and pagination that should survive a reload belong in `searchParams`.

## React rules

- Hooks at the top level of a component or another hook — never in a condition, loop, or callback.
- Keys are stable and unique to the item (`item.id`), never the array index.
- No hand-written `useMemo` / `useCallback` / `memo` — the React Compiler is on and adding them is noise.

## Framework primitives and styling

`next/link` for internal navigation (never a bare `<a>`), `next/image` for images, the Metadata API for titles and tags, `next/font` for fonts — a third-party equivalent only when the built-in cannot do the job.

Tailwind utilities in the JSX; `cn()` from `src/lib/utils` merges conditional classes. No inline `style` except genuinely dynamic values, no CSS modules, no stylesheet outside `src/styles`. Comments are one line, max — the non-obvious why, not the what.
