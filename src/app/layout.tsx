import type { Metadata } from "next";
import RootLayoutProvider from "@/providers/root-layout-provider";
import "@/styles/globals.css";
import { inter, plusJakartaSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "projectkit",
  description:
    "A layered Next.js reference app — leads, customers, pipelines, and follow-ups as the worked example.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <RootLayoutProvider>{children}</RootLayoutProvider>
      </body>
    </html>
  );
};

export default RootLayout;
