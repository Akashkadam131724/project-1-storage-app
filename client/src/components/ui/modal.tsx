import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-scrim"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-canvas p-5 shadow-raise">
        <h2 className="mb-3 text-base font-medium text-ink">{title}</h2>
        {children}
      </div>
    </div>
  );
}
