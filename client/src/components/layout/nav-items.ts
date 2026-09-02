import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Home,
  Palette,
  Settings,
  Shield,
  Star,
  Trash2,
} from "lucide-react";
import { paths } from "../../utils/paths.ts";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export const sideNav: NavItem[] = [
  { to: paths.home, label: "Home", icon: Home, end: true },
  { to: paths.recent, label: "Recent", icon: Clock },
  { to: paths.starred, label: "Starred", icon: Star },
  { to: paths.trash, label: "Trash", icon: Trash2 },
];

export const mobileNav: NavItem[] = [
  { to: paths.home, label: "Home", icon: Home, end: true },
  { to: paths.recent, label: "Recent", icon: Clock },
  { to: paths.starred, label: "Starred", icon: Star },
];

export const toolNav: NavItem[] = [
  { to: paths.settings, label: "Settings", icon: Settings },
  { to: paths.appearance, label: "Appearance", icon: Palette },
  { to: paths.trash, label: "Trash", icon: Trash2 },
];

export const adminNav: NavItem = {
  to: paths.admin,
  label: "Admin",
  icon: Shield,
};
