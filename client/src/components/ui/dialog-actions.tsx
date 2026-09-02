import type { ReactNode } from "react";

export function DialogActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
      {children}
    </div>
  );
}
