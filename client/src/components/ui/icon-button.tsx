import type { ReactNode } from "react";
import { Link } from "react-router";

type Props = {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  pressed?: boolean;
};

export function IconButton({ label, children, onClick, pressed }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={[
        "rounded-full p-2 transition-colors",
        pressed
          ? "bg-primary-container text-on-primary-container"
          : "text-muted hover:bg-line hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function IconLink({
  label,
  to,
  children,
}: {
  label: string;
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="rounded-full p-2 text-muted transition-colors hover:bg-line hover:text-ink"
    >
      {children}
    </Link>
  );
}
