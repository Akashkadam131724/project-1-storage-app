import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import type { ReactNode } from "react";

export function AccountList({ children }: { children: ReactNode }) {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-line bg-canvas shadow-raise">
      <div className="divide-y divide-line">{children}</div>
    </div>
  );
}

export function AccountTile({
  to,
  icon: Icon,
  title,
  hint,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="flex h-full items-start gap-4 rounded-xl border border-line bg-canvas p-5 shadow-raise transition hover:border-primary/40 hover:bg-chrome/50"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-ink">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">
          {hint}
        </span>
      </span>
      <ChevronRight className="mt-1 size-5 shrink-0 text-muted" />
    </Link>
  );
}

export function AccountRow({
  to,
  icon: Icon,
  title,
  hint,
  onClick,
  danger = false,
}: {
  to?: string;
  icon: LucideIcon;
  title: string;
  hint?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const body = (
    <>
      <span
        className={[
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          danger
            ? "bg-red-500/10 text-red-600"
            : "bg-primary-container text-on-primary-container",
        ].join(" ")}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-sm font-medium",
            danger ? "text-red-600" : "text-ink",
          ].join(" ")}
        >
          {title}
        </span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-muted">{hint}</span>
        ) : null}
      </span>
      {to ? <ChevronRight className="size-4 shrink-0 text-muted" /> : null}
    </>
  );

  const className =
    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-chrome/70";

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  );
}
