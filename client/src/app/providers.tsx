import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { env } from "../shared/config/env.ts";
import { ThemeProvider } from "../shared/theme/theme-provider.tsx";
import { useTheme } from "../shared/theme/theme-context.ts";
import { ErrorBoundary } from "../shared/ui/error-boundary.tsx";
import { createQueryClient } from "./query-client.ts";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const tree = (
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {children}
          <ThemedToaster />
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );

  if (!env.VITE_GOOGLE_CLIENT_ID) {
    return tree;
  }

  return (
    <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
      {tree}
    </GoogleOAuthProvider>
  );
}

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      richColors
      position="top-right"
      theme={isDark ? "dark" : "light"}
    />
  );
}
