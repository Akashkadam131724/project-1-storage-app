import type { LucideIcon } from "lucide-react";
import { Clock, Home, Star, Trash2 } from "lucide-react";
import { paths } from "../app/paths.ts";

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

export const mobileNav: NavItem[] = sideNav;
