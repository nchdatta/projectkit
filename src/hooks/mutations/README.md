# Mutation hooks

One file per resource: `use-<resource>-mutation.ts` — e.g. `use-leads-mutation.ts`, holding every write hook for that resource (create, update, delete, bulk actions).

```ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { leadClientService } from "@/services/lead.service.client";

export function useCreateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadClientService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }),
  });
}
```

Rules:

- Client services only (`*.service.client.ts`) — server services are read-only and attach no session in the browser.
- Invalidate through `@/lib/query-keys`, never a hand-written key array.
- No `try/catch`: the transport already rejects with `ApiError`. Let the component read `error.errors` and feed it to `setError`.
- Reads live in `src/hooks/queries/use-<resource>-query.ts`.
