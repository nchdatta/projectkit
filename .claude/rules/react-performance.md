# React / Next.js performance — must-follow

Source: [vercel-labs/agent-skills — react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices/rules). These six are CRITICAL/HIGH impact and non-negotiable. This file grows — new rules get appended below, existing ones only change on explicit instruction.

Every component below — pages included — follows the shape in `.claude/rules/frontend.md`: arrow function assigned to a `const`, props typed by an interface declared directly above it, default export on its own line at the bottom. Never `export default function`, never an inline default on the const. The "Incorrect" snippets are wrong only on the performance point; copy their style, not their structure.

## 1. Parallelize independent async work

Never sequential-`await` operations that don't depend on each other.

```ts
// Incorrect — second fetch waits on the first for no reason
const user = await fetchUser(id);
const posts = await fetchPosts(id);

// Correct
const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)]);
```

In API routes and Server Actions, start independent operations immediately, even before you're ready to await them.

## 2. Parallelize RSC fetches via composition

A Server Component tree awaits sequentially by default. Split fetching into sibling components instead of one parent awaiting everything before rendering its children.

```tsx
// Incorrect — Sidebar waits for Page's fetch to finish
const Page = async () => {
  const header = await fetchHeader();
  return (
    <div>
      <div>{header}</div>
      <Sidebar />
    </div>
  );
};

export default Page;
```

```tsx
// Correct — both fetch simultaneously
const Header = async () => {
  return <div>{await fetchHeader()}</div>;
};

const Sidebar = async () => {
  return <nav>{(await fetchSidebarItems()).map(renderItem)}</nav>;
};

const Page = () => {
  return (
    <div>
      <Header />
      <Sidebar />
    </div>
  );
};

export default Page;
```

Siblings that are not exported live in their own files under `src/components/<feature>/` — the default export at the bottom is per file, so a page does not accumulate three components.

Nested per-item fetches: chain each item's dependent fetch inside its own promise so one slow item doesn't block the rest.

## 3. Authenticate Server Actions internally

A Server Action (`"use server"`) is a public endpoint, reachable directly regardless of which page or layout guard normally leads to it. Verify auth inside the action itself — never rely solely on middleware, layout guards, or page-level checks.

## 4. Lazy-load heavy components, never import via a barrel

```ts
// Incorrect — pulls the whole library graph through index.ts
import { HeavyChart } from "@/components/charts";

// Correct
import dynamic from "next/dynamic";
const HeavyChart = dynamic(() => import("@/components/charts/heavy-chart"));
```

Barrel files (`index.ts` doing `export * from "./x"`) drag in every re-exported module even when only one is used — import from the source file directly.

## 5. Suspense over blocking awaits

Don't `await` data before returning JSX in an async Server Component — wrap the slow part in `<Suspense>` so the rest of the page renders immediately.

An `async` Page that awaits `fetchSlowData()` before returning its `<Layout>` holds the entire route hostage to the slowest call. Push the fetch into the child and put a boundary around it.

```tsx
// Correct — SlowSection fetches its own data behind the boundary
const Page = () => {
  return (
    <Layout>
      <Suspense fallback={<Skeleton />}>
        <SlowSection />
      </Suspense>
    </Layout>
  );
};

export default Page;
```

## 6. Never define a component inside a component

A component defined inside another component's body is a new type on every parent render — React remounts it from scratch, losing all its state and DOM.

```tsx
// Incorrect — Field is redefined, and remounted, on every ParentForm render
const ParentForm = () => {
  const Field = () => <input name="email" />;
  return <Field />;
};
```

```tsx
// Correct — defined once, at module scope
interface FieldProps {
  name: string;
}

const Field = ({ name }: FieldProps) => {
  return <input name={name} />;
};

const ParentForm = () => {
  return <Field name="email" />;
};

export default ParentForm;
```

Same trap in a `.map()` callback or a `useMemo` returning JSX-producing functions. A component belongs at module scope in its own file; anything else is a render prop, and should be typed and named as one.
