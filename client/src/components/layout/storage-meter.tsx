import { useQuery } from "@tanstack/react-query";
import { Cloud } from "lucide-react";
import { getFolder } from "../../apis/directories.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import {
  formatBytes,
  MAX_GUEST_STORAGE_BYTES,
  MAX_STORAGE_BYTES,
} from "../../utils/format.ts";
import { Link } from "react-router";
import { paths } from "../../utils/paths.ts";

export function StorageMeter() {
  const { user } = useAuth();
  const usage = useQuery({
    queryKey: ["folder", "root"],
    queryFn: () => getFolder(),
  });
  const used = usage.data?.folder.size ?? 0;
  const cap = user?.isGuest ? MAX_GUEST_STORAGE_BYTES : MAX_STORAGE_BYTES;
  const percent = Math.min(100, (used / cap) * 100);

  return (
    <div className="border-t border-line px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-muted">
        <Cloud className="size-4" aria-hidden />
        <span className="text-xs">Storage</span>
      </div>
      <div className="mb-2 h-2 w-full rounded-full bg-line">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${String(percent)}%` }}
        />
      </div>
      <p className="mb-3 text-xs text-muted">
        {formatBytes(used)} of {formatBytes(cap)} used
      </p>
      {user?.isGuest ? (
        <Link
          to={paths.register}
          className="block w-full rounded-xl border border-line bg-canvas px-3 py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-chrome"
        >
          Create an account
        </Link>
      ) : (
        <button
          type="button"
          className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-chrome"
        >
          Get more storage
        </button>
      )}
    </div>
  );
}
