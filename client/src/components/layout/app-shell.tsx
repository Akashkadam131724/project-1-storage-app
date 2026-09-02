import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import { OAuthNotice } from "../oauth-notice.tsx";
import { AuthBubbles } from "../../pages/AuthPage/AuthBubbles.tsx";
import { AppDrawer } from "./app-drawer.tsx";
import { AppHeader } from "./app-header.tsx";
import { AppSidebar } from "./app-sidebar.tsx";
import { BottomNav } from "./bottom-nav.tsx";
import { GuestBanner } from "./guest-banner.tsx";

export function AppShell() {
  const { pathname } = useLocation();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <div className="relative flex h-svh flex-col overflow-hidden bg-chrome">
      <img
        src="/login-hero.png"
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover object-left opacity-70 dark:opacity-30"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-chrome/35 dark:bg-chrome/70"
        aria-hidden
      />
      <AuthBubbles />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <OAuthNotice />
        <AppHeader />
        <GuestBanner />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="hidden lg:block">
            <AppSidebar />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
      <AppDrawer open={menuOpen} onClose={() => setMenuPath(null)} />
      <BottomNav onMenuClick={() => setMenuPath(pathname)} />
    </div>
  );
}
