import { Link, Outlet } from "react-router";
import { AuthBubbles } from "../../pages/AuthPage/AuthBubbles.tsx";
import { paths } from "../../utils/paths.ts";
import { BrandMark } from "../ui/brand-mark.tsx";
import { StorageHero } from "../ui/storage-hero.tsx";
import { ThemeSwitcher } from "../ui/theme-switcher.tsx";

export function PublicShell() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-chrome">
      <StorageHero className="pointer-events-none absolute inset-0 object-left opacity-70 dark:opacity-30" />
      <div
        className="pointer-events-none absolute inset-0 bg-chrome/35 dark:bg-chrome/70"
        aria-hidden
      />
      <AuthBubbles />
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <Link to={paths.login} aria-label="Storage home">
          <BrandMark />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link
            className="text-sm font-medium text-ink underline"
            to={paths.login}
          >
            Sign in
          </Link>
        </div>
      </header>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 lg:px-6 lg:pb-6">
        <Outlet />
      </div>
    </div>
  );
}
