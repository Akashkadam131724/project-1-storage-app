import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type PopoverBox = { top: number; left: number };

export function Popover({
  box,
  widthClass = "w-44",
  label,
  closeLabel = "Close menu",
  onClose,
  children,
}: {
  box: PopoverBox;
  widthClass?: string;
  label?: string;
  closeLabel?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useCloseOnMove(onClose);

  return createPortal(
    <>
      <button
        type="button"
        aria-label={closeLabel}
        className="fixed inset-0 z-50 cursor-default"
        onClick={onClose}
      />
      <div
        role="menu"
        aria-label={label}
        className={`fixed z-50 ${widthClass} rounded-xl border border-line bg-canvas py-1 shadow-raise`}
        style={{ top: box.top, left: box.left }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

export function placePopover(
  anchor: DOMRect,
  size: { width: number; height: number },
): PopoverBox {
  const edge = 12;
  const gap = 6;
  const desktop = window.matchMedia("(min-width: 1024px)").matches;
  const floor = desktop ? edge : 80;
  const openUp = window.innerHeight - anchor.bottom < size.height + floor;
  const top = openUp
    ? Math.max(edge, anchor.top - size.height - gap)
    : anchor.bottom + gap;
  const left = Math.min(
    Math.max(edge, anchor.right - size.width),
    window.innerWidth - size.width - edge,
  );
  return { top, left };
}

function useCloseOnMove(onClose: () => void) {
  useEffect(() => {
    const close = () => onClose();
    document.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [onClose]);
}
