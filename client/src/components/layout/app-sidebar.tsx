import { NavLink } from "react-router";
import { useAuth } from "../../contexts/auth-context.ts";
import { isAdmin } from "../../utils/roles.ts";
import { adminNav, sideNav } from "./nav-items.ts";
import { StorageMeter } from "./storage-meter.tsx";

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const items = isAdmin(user) ? [...sideNav, adminNav] : sideNav;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col">
      <nav className="flex-1 overflow-y-auto py-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "mx-2 flex items-center gap-2.5 rounded-r-xl px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary-container font-medium text-on-primary-container"
                  : "text-ink hover:bg-canvas",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={
                    isActive
                      ? "size-4 text-on-primary-container"
                      : "size-4 text-muted"
                  }
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <StorageMeter />
    </aside>
  );
}
