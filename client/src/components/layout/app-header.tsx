import { HelpCircle, Palette, Search, Settings } from "lucide-react";
import { BrandMark } from "../ui/brand-mark.tsx";
import { IconButton, IconLink } from "../ui/icon-button.tsx";
import { paths } from "../../utils/paths.ts";
import { UserMenu } from "./user-menu.tsx";

export function AppHeader() {
  return (
    <header className="px-3 py-3 lg:px-4">
      <div className="flex items-center gap-2">
        <div className="flex w-auto shrink-0 items-center lg:w-54">
          <span className="lg:hidden">
            <BrandMark compact />
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
        <div className="hidden shrink-0 items-center gap-0.5 lg:flex">
          <IconButton label="Help">
            <HelpCircle className="size-5" />
          </IconButton>
          <IconLink label="Settings" to={paths.settings}>
            <Settings className="size-5" />
          </IconLink>
          <IconLink label="Appearance" to={paths.appearance}>
            <Palette className="size-5" />
          </IconLink>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
