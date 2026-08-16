# Query hooks

One file per resource: `use-<resource>-query.ts` — e.g. `use-leads-query.ts`, holding every read hook for that resource (list, detail, filtered variants).

```ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import { leadService } from "@/services/lead.service";

export const useLeadsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.leads.list,
    queryFn: () => leadService.getLeads(),
  });
};

export const useLeadQuery = (id: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.leads.list, id],
    queryFn: () => leadService.getLead({ id }),
    enabled: !!id,
  });
};
```

Rules:

- Server service only (`*.service.ts`) — reads don't need a session, and only `fetch` participates in the Next.js cache. First paint / static data belongs in a Server Component instead, per `frontend.md`.
- Keys come from `QUERY_KEYS` in `@/lib/query-keys`, never a hand-written array — the same key a mutation invalidates is the key a query reads.
- No `try/catch`: the transport already rejects with `ApiError`. Handle all three states in the component — loading, error, empty.
- `staleTime` is 60s globally (`getQueryClient()`); don't override per-hook unless the resource genuinely needs a different cadence.
- Writes live in `src/hooks/mutations/use-<resource>-mutation.ts`.
