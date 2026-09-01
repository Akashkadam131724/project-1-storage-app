import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { AppDrawer } from "./app-drawer.tsx";
import { AppHeader } from "./app-header.tsx";
import { AppSidebar } from "./app-sidebar.tsx";
import { BottomNav } from "./bottom-nav.tsx";

export function AppShell() {
  const { pathname } = useLocation();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-chrome">
      <AppHeader onMenuClick={() => setMenuPath(pathname)} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
      <AppDrawer open={menuOpen} onClose={() => setMenuPath(null)} />
      <BottomNav />
    </div>
  );
}
