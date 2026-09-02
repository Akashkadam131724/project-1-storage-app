import type { ReactNode } from "react";

export function StatusMessage({ children }: { children: ReactNode }) {
  return <p className="py-16 text-center text-sm text-muted">{children}</p>;
}
