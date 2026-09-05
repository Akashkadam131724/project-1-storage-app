import { useAuth } from "../../contexts/auth-context.ts";
import { AuthLoader } from "../AuthLoader.tsx";
import { AppShell } from "../layout/app-shell.tsx";
import { PublicShell } from "../layout/public-shell.tsx";

export function PublicRoute() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return <AuthLoader />;
  }

  if (user) {
    return <AppShell />;
  }

  return <PublicShell />;
}
