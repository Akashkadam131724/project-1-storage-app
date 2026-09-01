import type { ReactNode } from "react";

type Props = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageCanvas({ title, actions, children }: Props) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas lg:mb-3 lg:mr-3 lg:rounded-2xl">
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 lg:px-8 lg:pt-8">
        <h1 className="text-base font-medium text-ink">{title}</h1>
        {actions}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-20 lg:px-8 lg:pb-8">
        {children}
      </div>
    </section>
  );
}
