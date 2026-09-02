import { Navigate } from "react-router";
import { useAuth } from "../../contexts/auth-context.ts";
import { AdminPage } from "../../pages/AdminPage/index.tsx";
import { isAdmin } from "../../utils/roles.ts";
import { paths } from "../../utils/paths.ts";

export function AdminRoute() {
  const { user } = useAuth();
  if (!isAdmin(user)) {
    return <Navigate to={paths.home} replace />;
  }
  return <AdminPage />;
}
