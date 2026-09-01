import { X } from "lucide-react";
import { BrandMark } from "../shared/ui/brand-mark.tsx";
import { IconButton } from "../shared/ui/icon-button.tsx";
import { AppSidebar } from "./app-sidebar.tsx";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AppDrawer({ open, onClose }: Props) {
  return (
    <div
      className={[
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
      inert={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        className={[
          "absolute inset-0 bg-scrim transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />
      <div
        className={[
          "absolute inset-y-0 left-0 flex w-[70%] max-w-xs flex-col rounded-r-3xl bg-chrome shadow-raise transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <BrandMark />
          <IconButton label="Close menu" onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1">
          <AppSidebar onNavigate={() => window.setTimeout(onClose, 0)} />
        </div>
      </div>
    </div>
  );
}
