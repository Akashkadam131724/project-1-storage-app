import { Cloud } from "lucide-react";

export function StorageMeter() {
  return (
    <div className="border-t border-line px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-muted">
        <Cloud className="size-4" aria-hidden />
        <span className="text-xs">Storage</span>
      </div>
      <div className="mb-2 h-2 w-full rounded-full bg-line">
        <div className="h-2 w-0 rounded-full bg-primary" />
      </div>
      <p className="mb-3 text-xs text-muted">0 MB of 500 MB used</p>
      <button
        type="button"
        className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-chrome"
      >
        Get more storage
      </button>
    </div>
  );
}
