import { HelpCircle } from "lucide-react";
import { NavLink } from "react-router";
import { useAuth } from "../../contexts/auth-context.ts";
import { isAdmin } from "../../utils/roles.ts";
import { adminNav, sideNav, toolNav, type NavItem } from "./nav-items.ts";
import { StorageMeter } from "./storage-meter.tsx";

export function AppSidebar({
  onNavigate,
  toolsOnly = false,
}: {
  onNavigate?: () => void;
  toolsOnly?: boolean;
}) {
  const { user } = useAuth();
  const browse = isAdmin(user) ? [...sideNav, adminNav] : sideNav;
  const tools = isAdmin(user) ? [...toolNav, adminNav] : toolNav;
  const items = toolsOnly ? tools : browse;

  return (
    <aside className="flex h-full w-full shrink-0 flex-col lg:w-60">
      <nav className="flex-1 overflow-y-auto py-1">
        {items.map((item) => (
          <SideLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}
        {toolsOnly ? <HelpButton /> : null}
      </nav>
      <StorageMeter />
    </aside>
  );
}

function HelpButton() {
  return (
    <button
      type="button"
      className="me-2 flex w-[calc(100%-0.5rem)] items-center gap-2.5 rounded-r-xl px-4 py-2.5 text-left text-sm text-ink hover:bg-canvas"
    >
      <HelpCircle className="size-4 text-muted" />
      Help
    </button>
  );
}

function SideLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "me-2 mb-1 flex items-center gap-2.5 rounded-r-xl px-4 py-2.5 text-sm transition-colors",
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
  );
}
