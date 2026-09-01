import { createBrowserRouter } from "react-router";
import { AppShell } from "./app-shell.tsx";
import { paths } from "./paths.ts";
import { LoginPage, RegisterPage } from "../pages/auth-pages.tsx";
import { HomePage } from "../pages/home-page.tsx";
import { RecentPage, StarredPage, TrashPage } from "../pages/library-pages.tsx";
import { NotFoundPage } from "../pages/not-found-page.tsx";

export const routes = [
  {
    path: paths.home,
    Component: AppShell,
    children: [
      { index: true, Component: HomePage },
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
