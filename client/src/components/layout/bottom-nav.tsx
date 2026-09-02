import { Menu } from "lucide-react";
import { NavLink } from "react-router";
import { mobileNav } from "./nav-items.ts";

export function BottomNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas px-4 shadow-raise lg:hidden">
      <div className="flex h-16 items-center justify-between">
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                "flex flex-col items-center gap-1 text-xs",
                isActive ? "font-medium text-primary" : "text-muted",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={isActive ? "size-5 text-primary" : "size-5"}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          aria-label="Open menu"
          className="flex flex-col items-center gap-1 text-xs text-muted"
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
          Menu
        </button>
      </div>
    </nav>
  );
}
