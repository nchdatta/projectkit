import { request } from "@/lib/fetcher";
import type { GetArg, Lead, ListArg } from "@/services/types";

// Reference server service — reads only via fetch (Next caching applies); mutations live in the client file.
export const leadService = {
  getLeads: (args: ListArg) =>
    request<Lead[]>("/leads", {
      params: { page: args.page, limit: args.limit, search: args.search },
    }),
  getLead: (args: GetArg) => request<Lead>(`/leads/${args.id}`, {}),
};
