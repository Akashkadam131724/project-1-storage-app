import { createBrowserRouter } from "react-router";
import { AdminRoute } from "../components/routes/admin-route.tsx";
import { ProtectedRoute } from "../components/routes/protected-route.tsx";
import { ForgotPage } from "../pages/AuthPage/ForgotPage.tsx";
import { LoginPage } from "../pages/AuthPage/LoginPage.tsx";
import { RegisterPage } from "../pages/AuthPage/RegisterPage.tsx";
import { DirectoryPage } from "../pages/DirectoryPage/index.tsx";
import { FilePage } from "../pages/FilePage/index.tsx";
import {
  RecentPage,
  StarredPage,
  TrashPage,
} from "../pages/LibraryPage/index.tsx";
import { NotFoundPage } from "../pages/NotFoundPage/index.tsx";
import { AppearancePage } from "../pages/AppearancePage/index.tsx";
import { PasswordPage } from "../pages/PasswordPage/index.tsx";
import { ProfilePage } from "../pages/ProfilePage/index.tsx";
import { SettingsPage } from "../pages/SettingsPage/index.tsx";
import { paths } from "../utils/paths.ts";

export const routes = [
  {
    path: paths.home,
    Component: ProtectedRoute,
    children: [
      { index: true, Component: DirectoryPage },
      { path: "directory/:folderId", Component: DirectoryPage },
      { path: "files/:fileId", Component: FilePage },
      { path: "trash", Component: TrashPage },
      { path: "starred", Component: StarredPage },
      { path: "recent", Component: RecentPage },
      { path: "profile", Component: ProfilePage },
      { path: "appearance", Component: AppearancePage },
      { path: "settings", Component: SettingsPage },
      { path: "password", Component: PasswordPage },
      { path: "admin", Component: AdminRoute },
    ],
  },
  { path: paths.login, Component: LoginPage },
  { path: paths.register, Component: RegisterPage },
  { path: paths.forgot, Component: ForgotPage },
  { path: "*", Component: NotFoundPage },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
