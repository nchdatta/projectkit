# Frontend code style

Must-follow. This project is frontend-only — see the scope boundaries in `AGENTS.md`.
Append-only: existing entries change only on explicit instruction.

## Component definition

Arrow function assigned to a `const`, props typed by an interface directly above it, default
export on its own line at the bottom. Never `export default function`, never an inline default on
the const. Destructure props in the signature and type every one explicitly — no `any`, `children`
is `ReactNode`.

```tsx
interface ItemCardProps {
  item: Item;
  onSelect?: (id: string) => void;
}

const ItemCard = ({ item, onSelect }: ItemCardProps) => {
  return <div>{item.title}</div>;
};

export default ItemCard;
```

`src/components/ui/**` is shadcn CLI output and follows the upstream convention instead —
`function` declarations, named exports, `data-slot` attributes. Reach for
`npx shadcn@latest add <component>` before hand-rolling a primitive, and never reformat a
generated one to match the app style; regeneration undoes it.

## Typography — prefer existing components over ad-hoc classes

If the project has a typography layer (e.g. `src/components/shared/typography/`), route every text
element through it rather than a raw `<p>`/`<span>`/`<h1>` with hand-picked `text-*`/`font-*`
classes. Pick by role (heading vs body vs label vs caption), not by eyeballing size. Extend an
existing component via its `size`/`as` prop before adding a new one; a genuinely new text role is
the only reason to add one.

When implementing from a design (image, Figma, spec), font-weight, font-size, and color must match
the source exactly — no eyeballing, no "close enough". Map the source values to the matching
typography component and its `size` prop (or the closest semantic color token if none covers it);
if no combination matches, that's a signal to check the source again before reaching for a raw
class.

## Where a component goes

`src/components/<area>/<module>/<component>.tsx`, where area is:

| Area          | Holds                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`        | signed-in surface, everything behind the authenticated prefix                                                                                                              |
| `storefront/` | public marketing and auth screens                                                                                                                                          |
| `providers/`  | client context providers                                                                                                                                                    |
| `ui/`         | shadcn primitives — generated, not hand-written                                                                                                                             |
| `shared/`     | composed, generic components used by both `app/` and `storefront/` — no shadcn generator exists for them, and no business meaning (buttons, typography, form/filter chrome) |

Files are kebab-case, one component per file. The module folder matches the route it serves, not
the entity it renders. `app/` and `storefront/` never import from each other: a component both
need is a `ui/` primitive if it is generic, otherwise promote it to `shared/`. Promote on the
second real cross-area import, not the first resemblance — a component used only within `app/`
stays in `components/app/<module>/` (or `components/app/shared/` once a second `app/`-only module
needs it), it does not jump straight to `components/shared/`.

## Server Components by default

`'use client'` only when the file needs state, effects, event handlers, or a browser API — and
then on the smallest leaf that needs it. The directive is contagious: every import below a client
component becomes client too. A page with one interactive filter bar stays a Server Component and
renders `<FilterBar />` as a client child. Pass server-fetched data down as props rather than
making the parent client so it can fetch.

Static and first-paint data is fetched in a Server Component. A TanStack Query hook is for
user-driven data — refetching, mutation-invalidated, paginated by a control, polled. Never render
an empty client shell that immediately fetches what the server already knew.

Anything reading `useSearchParams` needs a `<Suspense>` boundary.

Layouts and pages type their props with Next 16's generated helpers — `LayoutProps<'/...'>`,
`PageProps<'/...'>` — never a hand-written `{ children }` type. `params` and `searchParams` are
Promises and must be awaited.

## Render is pure

No mutation, fetching, subscriptions, `localStorage`, or DOM reads during render. Effects
synchronize with something outside React — they do not derive values, and they do not react to a
prop change a plain expression could compute. Mutating props, state, or module scope during render
silently opts the component out of the React Compiler.

## State is minimal

Four tiers, in order of preference: Server Components → TanStack Query → `useState` /
`useReducer` → URL state.

- Never store what you can derive from props, existing state, or the URL.
- Local `useState` by default; lift only when a second component needs it; context only for
  app-wide concerns, mounted through a single root provider component.
- Server state lives in TanStack Query via a shared `getQueryClient()`, never copied into
  `useState`. Two distant components needing the same data call the same key.
- Filters, tabs, and pagination that should survive a reload belong in `searchParams`.
- No Redux, Zustand, Jotai, or any global store.

## Data access

The backend is a separate service reached through `NEXT_PUBLIC_API_BASE_URL`. Mutations go to it
over HTTP from client code. Do not proxy through a Next route handler, do not add a Server Action
that writes — a Server Action file is revalidation only, and cache tags come from
`src/lib/cache-tags.ts`. Only `NEXT_PUBLIC_*` variables are readable in the browser, and every new
variable is added to `.env.example`.

## React rules

- Hooks at the top level of a component or another hook — never in a condition, loop, or callback.
- Keys are stable and unique to the item (`item.id`), never the array index.
- No hand-written `useMemo` / `useCallback` / `memo` — the React Compiler is on and adding them is
  noise. The exception is a value whose identity is semantically load-bearing, e.g. a dependency of
  an effect that must not re-run.
- Handle all three states of a query — loading, error, empty — not just the happy path.

## Forms

react-hook-form + `zodResolver`, `noValidate` on the `<form>` so zod owns the messages. Schemas
live in `src/lib/validations/<resource>.ts` and export inferred input types; reuse field-level
schemas (e.g. `emailSchema`, `passwordSchema`) rather than redeclaring rules. Render errors through
`Field` / `FieldError`, and set both `aria-invalid` and `data-invalid`. Auth failures stay generic
("Invalid email or password.") — never reveal whether an account exists.

## Framework primitives and styling

`next/link` for internal navigation (never a bare `<a>`), `next/image` for images, the Metadata API
for titles and tags, fonts from `src/lib/fonts.ts` (never inline `next/font` in a component) — a
third-party equivalent only when the built-in cannot do the job.

Tailwind v4 is configured CSS-first in `src/styles/globals.css`; there is no `tailwind.config`.
Style with semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`) where one
fits, and never a `dark:` variant for a color a token already handles. `cn()` from `@/lib/utils`
merges conditional classes; build variants with `cva` exported as `buttonVariants`-style so a
`<Link>` can borrow button styling without nesting a button. Run `npm run format` rather than
hand-ordering classes. No inline `style` except genuinely dynamic values, no CSS modules, no
stylesheet outside `src/styles`.

Import with the `@/` alias, never a deep relative path. Comments are one line, max — the
non-obvious why, not the what.
