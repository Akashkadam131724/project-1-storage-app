import type { ReactNode } from "react";

export function PanelCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-canvas shadow-raise">
      {title ? (
        <header className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}
