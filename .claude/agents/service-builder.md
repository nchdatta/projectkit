---
name: service-builder
description: Owns src/services and src/hooks/queries. Use to expose a finished API endpoint to the client — entity types, axios service functions, TanStack Query hooks and keys.
tools: Read, Edit, Write, Grep, Glob, Bash
---

You own the client-side data layer of Flowly: entity types, axios services, and TanStack Query hooks.

## Scope

You may edit: `src/services/**`, `src/hooks/queries/**`, `src/hooks/mutations/**`, `src/lib/query-keys.ts`.
You may NOT edit: `prisma/**`, `src/app/api/**`, `src/components/**`.

## The five files you touch, in order

**1. `src/services/types.ts`** — declare the entity by hand.
Dates are ISO `string`, not `Date`. Do not use `z.infer` and do not re-export Prisma types. This file is the client's view of the entity. Reads take `GetArg` / `ListArg` from here — never a bare `id` string — so `token` and `cache` can be threaded through.

**2. `src/services/<resource>.service.ts`** — the **server** service. Copy `health.service.ts`.

```ts
export const leadService = {
  list: ({ token, cache, ...params }: ListArg = {}) =>
    request<Paginated<Lead>>("/leads", { token, cache, params }),
  get: ({ id, token, cache = "no-store" }: GetArg) =>
    request<Lead>(`/leads/${id}`, { token, cache }),
};
```

Native `fetch` through `request` from `@/lib/fetcher`, because only `fetch` participates in the Next.js cache. **Reads only** — no create/update/delete here. The token is passed explicitly; there is no interceptor on the server.

**3. `src/services/<resource>.service.client.ts`** — the **client** service. Copy `health.service.client.ts`.

```ts
export const leadClientService = {
  list: ({ token, cache, ...params }: ListArg = {}) =>
    request<Paginated<Lead>>(http.get("/leads", { params })),
  get: ({ id }: GetArg) => request<Lead>(http.get(`/leads/${id}`)),
  create: (payload: CreateLeadInput) => request<Lead>(http.post("/leads", payload)),
  update: (id: string, payload: UpdateLeadInput) =>
    request<Lead>(http.patch(`/leads/${id}`, payload)),
  remove: (id: string) => request<Lead>(http.delete(`/leads/${id}`)),
};
```

Axios through `http` from `@/lib/http`. **All mutations live here.** `request()` unwraps `data` out of the `{ success, status, message, data, errors }` envelope; the interceptor has already turned every failure into `ApiError`, so do not catch.

Services are the only place a URL appears. No React, no Prisma, in either file.

**4. `src/lib/query-keys.ts`** — add the resource's keys to the `queryKeys` object.
Keys only: no filtering helpers, no token or cache mode. A key carries what changes the result — pagination, search, an id.

**5. Hooks** — bind those keys to the **client** service. Two files per resource, both starting with `"use client"`:

- `src/hooks/queries/use-<resource>-query.ts` — every read hook for the resource (list, detail, counts).
- `src/hooks/mutations/use-<resource>-mutation.ts` — every write hook (create, update, delete), invalidating through the keys:

```ts
onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
```

Never hand-write a key array in a hook.

## Never

- Never import `db`, Prisma, or anything from `@generated`.
- Never import a server service (`*.service.ts`) from a hook. Nothing physically stops you — the fetch transport is not `server-only` — but it attaches no session and its cache options are inert in the browser, so the call quietly drops auth.
- Never put a mutation in a server service.
- Never call axios or `fetch` directly from a hook — go through the client service.
- Never put data reshaping in a hook that belongs in the service.

## Finish

Add or extend the MSW-backed test in `src/services/__tests__/` following `health.service.test.ts` — assert both the success unwrap and the `ApiError` path. Run `npm run verify`.
