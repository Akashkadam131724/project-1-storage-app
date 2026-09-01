import { HelpCircle, Menu, Search, Settings } from "lucide-react";
import { ThemeSwitcher } from "../ui/theme-switcher.tsx";
import { BrandMark } from "../ui/brand-mark.tsx";
import { IconButton } from "../ui/icon-button.tsx";
import { UserMenu } from "./user-menu.tsx";

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-chrome px-3 py-3 lg:px-4">
      <div className="flex items-center gap-2">
        <div className="flex w-auto shrink-0 items-center lg:w-60">
          <span className="lg:hidden">
            <IconButton label="Open menu" onClick={onMenuClick}>
              <Menu className="size-5" />
            </IconButton>
          </span>
          <span className="hidden lg:block">
            <BrandMark />
          </span>
        </div>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search in Storage</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search in Storage"
            className="w-full max-w-2xl rounded-3xl bg-search py-3 pr-4 pl-14 text-sm text-ink outline-none ring-primary transition focus:ring-2"
          />
        </label>
        <div className="flex shrink-0 items-center gap-0.5">
          <span className="hidden lg:flex">
            <IconButton label="Help">
              <HelpCircle className="size-5" />
            </IconButton>
            <IconButton label="Settings">
              <Settings className="size-5" />
            </IconButton>
          </span>
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
