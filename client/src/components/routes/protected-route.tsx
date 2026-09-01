import { Navigate } from "react-router";
import { useAuth } from "../../contexts/auth-context.ts";
import { paths } from "../../utils/paths.ts";
import { AuthLoader } from "../AuthLoader.tsx";
import { AppShell } from "../layout/app-shell.tsx";

export function ProtectedRoute() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return <AuthLoader />;
  }

  if (!user) {
    return <Navigate to={paths.login} replace />;
  }

  return <AppShell />;
}
