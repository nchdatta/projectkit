# Query hooks

One file per resource: `use-<resource>-query.ts` — e.g. `use-leads-query.ts`, holding every read hook for that resource (list, detail, filtered variants).

```ts
'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import { leadClientService } from '@/services/lead.service.client';

export const useLeadsQuery = () => {
  return useQuery({
    queryKey: queryKeys.leads.all,
    queryFn: leadClientService.list,
  });
};

export const useLeadQuery = (id: string) => {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => leadClientService.get(id),
    enabled: !!id,
  });
};
```

Rules:

- Client services only (`*.service.client.ts`) — server services are read-only and attach no session in the browser. First paint / static data belongs in a Server Component instead, per `frontend.md`.
- Keys come from `@/lib/query-keys`, never a hand-written array — the same key a mutation invalidates is the key a query reads.
- No `try/catch`: the transport already rejects with `ApiError`. Handle all three states in the component — loading, error, empty.
- `staleTime` is 60s globally (`getQueryClient()`); don't override per-hook unless the resource genuinely needs a different cadence.
- Writes live in `src/hooks/mutations/use-<resource>-mutation.ts`.
