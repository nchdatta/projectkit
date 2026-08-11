"use client";

import type { ReactNode } from "react";

import ReactQueryProvider from "@/providers/react-query-provider";

interface RootLayoutProviderProps {
  children: ReactNode;
}

// The single provider the root layout mounts; every app-wide provider composes here.
const RootLayoutProvider = ({ children }: RootLayoutProviderProps) => {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
};

export default RootLayoutProvider;
