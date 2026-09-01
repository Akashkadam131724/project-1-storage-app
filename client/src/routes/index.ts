import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "../components/routes/protected-route.tsx";
import { LoginPage } from "../pages/AuthPage/LoginPage.tsx";
import { RegisterPage } from "../pages/AuthPage/RegisterPage.tsx";
import { DirectoryPage } from "../pages/DirectoryPage/index.tsx";
import {
  RecentPage,
  StarredPage,
  TrashPage,
} from "../pages/LibraryPage/index.tsx";
import { NotFoundPage } from "../pages/NotFoundPage/index.tsx";
import { paths } from "../utils/paths.ts";

export const routes = [
  {
    path: paths.home,
    Component: ProtectedRoute,
    children: [
      { index: true, Component: DirectoryPage },
      { path: "directory/:folderId", Component: DirectoryPage },
      { path: "trash", Component: TrashPage },
      { path: "starred", Component: StarredPage },
      { path: "recent", Component: RecentPage },
    ],
  },
  { path: paths.login, Component: LoginPage },
  { path: paths.register, Component: RegisterPage },
  { path: "*", Component: NotFoundPage },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
