"use client";

import React, { useState } from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider";
import { NotificationProvider } from "./NotificationProvider";
import { Toaster } from "sonner";
import { themeConfig } from "../config/theme";
import dynamic from "next/dynamic";

const GlobalSparkyAssistant = dynamic(
  () => import("../features/ai/components/GlobalSparkyAssistant"),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  // Safe instantiation of QueryClient for App Router SSR isolation
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme={themeConfig.defaultTheme}
        storageKey={themeConfig.storageKey}
        enableSystem
      >
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
            <GlobalSparkyAssistant />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
