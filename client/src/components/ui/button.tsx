import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

export type ButtonVariant =
  | "primary"
  | "danger"
  | "ghost"
  | "outline"
  | "soft"
  | "danger-soft"
  | "danger-outline"
  | "link";

type ButtonSize = "xs" | "sm" | "md" | "lg";
type ButtonShape = "pill" | "rounded";

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  block?: boolean;
  className?: string;
};

type Props = Shared &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
  };

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary font-medium text-on-primary hover:opacity-90",
  danger: "bg-red-600 font-medium text-white",
  ghost: "text-muted",
  outline: "border border-line text-ink hover:bg-chrome",
  soft: "bg-primary-container font-medium text-on-primary-container",
  "danger-soft": "bg-red-500/10 font-medium text-red-600 hover:bg-red-500/20",
  "danger-outline": "border border-red-500/25 text-red-600 hover:bg-red-500/10",
  link: "font-medium text-primary",
};

const sizeClass: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-4 py-2.5 text-sm",
};

export function Button({
  variant = "primary",
  size = "sm",
  shape = "pill",
  block = false,
  className,
  type = "button",
  children,
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, shape, block, className })}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = "primary",
  size = "sm",
  shape = "pill",
  block = false,
  className,
  children,
  onClick,
}: Shared & { to: string; onClick?: () => void; children: ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={buttonClass({ variant, size, shape, block, className })}
    >
      {children}
    </Link>
  );
}

export function ButtonAnchor({
  href,
  variant = "primary",
  size = "sm",
  shape = "pill",
  block = false,
  className,
  children,
}: Shared & { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className={buttonClass({ variant, size, shape, block, className })}
    >
      {children}
    </a>
  );
}

function buttonClass({
  variant = "primary",
  size = "sm",
  shape = "pill",
  block = false,
  className,
}: Shared) {
  return [
    "inline-flex items-center justify-center gap-1.5 disabled:opacity-50",
    shape === "pill" ? "rounded-full" : "rounded-lg",
    sizeClass[size],
    variantClass[variant],
    block ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
