import type { LucideIcon } from "lucide-react";
import { Clock, Star, Trash2 } from "lucide-react";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import type { DriveMode } from "../../hooks/drive-types.ts";
import { useDriveWorkspace } from "../../hooks/use-drive-workspace.ts";
import { useRecent, useStarred, useTrash } from "../../hooks/use-library.ts";
import { DriveDialogs } from "../DirectoryPage/DriveDialogs.tsx";
import { ItemGrid } from "../DirectoryPage/ItemGrid.tsx";
import { paths } from "../../utils/paths.ts";

export function TrashPage() {
  const query = useTrash();
  return (
    <LibraryCanvas
      title="Trash"
      icon={Trash2}
      mode="trash"
      empty="Trash is empty"
      hint="Deleted files will appear here"
      loading={query.isPending}
      folders={query.data?.folders.items ?? []}
      files={query.data?.files.items ?? []}
    />
  );
}

export function StarredPage() {
  const query = useStarred();
  return (
    <LibraryCanvas
      title="Starred"
      icon={Star}
      mode="starred"
      empty="No starred items"
      hint="Star files and folders to find them quickly"
      loading={query.isPending}
      folders={query.data?.folders.items ?? []}
      files={query.data?.files.items ?? []}
    />
  );
}

export function RecentPage() {
  const query = useRecent();
  return (
    <LibraryCanvas
      title="Recent"
      icon={Clock}
      mode="recent"
      empty="No recent files"
      hint="Files you open will show up here"
      loading={query.isPending}
      folders={[]}
      files={query.data?.items ?? []}
    />
  );
}

function LibraryCanvas({
  title,
  icon: Icon,
  mode,
  empty,
  hint,
  loading,
  folders,
  files,
}: {
  title: string;
  icon: LucideIcon;
  mode: DriveMode;
  empty: string;
  hint: string;
  loading: boolean;
  folders: Parameters<typeof ItemGrid>[0]["folders"];
  files: Parameters<typeof ItemGrid>[0]["files"];
}) {
  const workspace = useDriveWorkspace();
  const isEmpty = !loading && folders.length === 0 && files.length === 0;

  return (
    <>
      <PageCanvas title={title} backTo={paths.home}>
        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : isEmpty ? (
          <div className="py-20 text-center">
            <Icon className="mx-auto mb-4 size-20 text-subtle" />
            <p className="mb-2 text-lg text-muted">{empty}</p>
            <p className="text-sm text-subtle">{hint}</p>
          </div>
        ) : (
          <ItemGrid
            folders={folders}
            files={files}
            mode={mode}
            actions={workspace.actions}
          />
        )}
      </PageCanvas>
      <DriveDialogs workspace={workspace} />
    </>
  );
}
