import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../contexts/auth-context.ts";
import { paths } from "../../utils/paths.ts";
import { AuthLoader } from "../AuthLoader.tsx";

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return <AuthLoader />;
  }

  if (user) {
    return <Navigate to={paths.home} replace />;
  }

  return children;
}
