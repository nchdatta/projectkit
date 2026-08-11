"use client";

import type { ReactNode } from "react";

import { ReactQueryProvider } from "@/providers/react-query-provider";

/**
 * The single provider the root layout mounts.
 *
 * Every app-wide provider composes here — TanStack Query today, theme, session,
 * and toasts as they land — so `src/app/layout.tsx` never grows a nesting
 * pyramid and the ordering between providers lives in one readable place.
 *
 * Order matters: providers that others depend on go outermost.
 */
export function RootLayoutProvider({ children }: { children: ReactNode }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
