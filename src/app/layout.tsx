import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import RootLayoutProvider from "@/providers/root-layout-provider";

import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flowly",
  description: "A simple, modern CRM for leads, customers, pipelines, and follow-ups.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <RootLayoutProvider>{children}</RootLayoutProvider>
      </body>
    </html>
  );
};

export default RootLayout;
