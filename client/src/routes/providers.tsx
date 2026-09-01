import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "../contexts/auth-provider.tsx";
import { ThemeProvider } from "../contexts/theme/theme-provider.tsx";
import { useTheme } from "../contexts/theme/theme-context.ts";
import { ErrorBoundary } from "../components/ui/error-boundary.tsx";
import { env } from "../utils/env.ts";
import { createQueryClient } from "../utils/query-client.ts";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const tree = (
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            <ThemedToaster />
          </AuthProvider>
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
