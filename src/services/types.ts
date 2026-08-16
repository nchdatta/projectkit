// Entity shapes, hand-written, dates as ISO `string`. Not `z.infer`, not re-exported Prisma types.
export type ApiErrors = Record<string, string[]>;

// Envelope returned by every Route Handler, already unwrapped by `request()`.
export type Pagination = {
  total: number;
  limit: number;
  current_page: number;
  total_pages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T | null;
  pagination?: Pagination;
  errors?: ApiErrors;
};

// Shape of a list handler's `data` — items plus the paging fields it was queried with.
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

// `token`: passed explicitly server-side; on the client the interceptor attaches it. `cache`: fetch-only.
export interface GetArg {
  token?: string | null;
  id?: string;
  cache?: RequestCache;
}

// Argument shape for a list read: pagination and search on top of `GetArg`.
export interface ListArg extends Omit<GetArg, "id"> {
  page?: number;
  limit?: number;
  search?: string;
}

// `ListArg` minus the transport fields — what a query key is built from.
export type ListFilters = Omit<ListArg, "token" | "cache">;

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "LOST" | "CONVERTED";

// Reference entity — the worked example for the layering contract.
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// More CRM entities (Contact, Deal, Activity, …) are declared here as they are built.
