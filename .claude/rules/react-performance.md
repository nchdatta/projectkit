# React / Next.js performance — must-follow

Six CRITICAL/HIGH rules from [vercel-labs/agent-skills — react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices/rules). Non-negotiable. Append-only — existing entries change only on explicit instruction.

Components below follow `frontend.md`: arrow const, interface above, default export last. "Incorrect" snippets are wrong only on the performance point — copy their style, not their structure.

## 1. Parallelize independent async work

Never sequential-`await` operations that don't depend on each other. In API routes and Server Actions, start independent operations immediately, even before you're ready to await them.

```ts
// Incorrect — second fetch waits on the first for no reason
const user = await fetchUser(id);
const posts = await fetchPosts(id);

// Correct
const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)]);
```

## 2. Parallelize RSC fetches via composition

A Server Component tree awaits sequentially by default. Split fetching into sibling components instead of one parent awaiting everything before rendering its children. For nested per-item fetches, chain each item's dependent fetch inside its own promise so one slow item doesn't block the rest.

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

// Correct — both fetch simultaneously
const Header = async () => <div>{await fetchHeader()}</div>;
const Sidebar = async () => <nav>{(await fetchSidebarItems()).map(renderItem)}</nav>;

const Page = () => (
  <div>
    <Header />
    <Sidebar />
  </div>
);

export default Page;
```

Siblings that are not exported live in their own files under `src/components/<feature>/` — the default export at the bottom is per file, so a page does not accumulate three components.

## 3. Authenticate Server Actions internally

A Server Action (`"use server"`) is a public endpoint, reachable directly regardless of which page or layout guard normally leads to it. Verify auth inside the action itself — never rely solely on a proxy, layout guard, or page-level check.

## 4. Lazy-load heavy components, never import via a barrel

Barrel files (`index.ts` doing `export * from "./x"`) drag in every re-exported module even when only one is used — import from the source file directly.

```ts
// Incorrect — pulls the whole library graph through index.ts
import { HeavyChart } from "@/components/charts";

// Correct
import dynamic from "next/dynamic";
const HeavyChart = dynamic(() => import("@/components/charts/heavy-chart"));
```

## 5. Suspense over blocking awaits

Don't `await` data before returning JSX in an async Server Component — an `async` Page awaiting `fetchSlowData()` before returning its `<Layout>` holds the whole route hostage to the slowest call. Push the fetch into the child and wrap it in a boundary.

```tsx
// Correct — SlowSection fetches its own data behind the boundary
const Page = () => (
  <Layout>
    <Suspense fallback={<Skeleton />}>
      <SlowSection />
    </Suspense>
  </Layout>
);

export default Page;
```

## 6. Never define a component inside a component

A component defined inside another component's body is a new type on every parent render — React remounts it from scratch, losing all its state and DOM. Same trap in a `.map()` callback or a `useMemo` returning JSX-producing functions. A component belongs at module scope in its own file; anything else is a render prop, and should be typed and named as one.

```tsx
// Incorrect — Field is redefined, and remounted, on every ParentForm render
const ParentForm = () => {
  const Field = () => <input name="email" />;
  return <Field />;
};

// Correct — defined once, at module scope
interface FieldProps {
  name: string;
}

const Field = ({ name }: FieldProps) => <input name={name} />;

const ParentForm = () => <Field name="email" />;

export default ParentForm;
```
