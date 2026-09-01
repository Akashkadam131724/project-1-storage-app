import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  onClick?: () => void;
};

export function IconButton({ label, children, onClick }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="rounded-full p-2 text-muted transition-colors hover:bg-line hover:text-ink"
    >
      {children}
    </button>
  );
}
