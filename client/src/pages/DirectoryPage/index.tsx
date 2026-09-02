import { useState } from "react";
import { Link, useParams } from "react-router";
import { useFolder } from "../../hooks/use-folder.ts";
import { useDriveWorkspace } from "../../hooks/use-drive-workspace.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import type { PublicFolder } from "../../apis/types.ts";
import { folderOrHome, paths } from "../../utils/paths.ts";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { DriveDialogs } from "./DriveDialogs.tsx";
import { ItemGrid } from "./ItemGrid.tsx";
import { Toolbar, type FolderLayout } from "./Toolbar.tsx";

const layoutKey = "storage-layout";

function readLayout(): FolderLayout {
  return localStorage.getItem(layoutKey) === "list" ? "list" : "grid";
}

export function DirectoryPage() {
  const { user } = useAuth();
  const { folderId } = useParams();
  const folder = useFolder(folderId);
  const workspace = useDriveWorkspace();
  const [layout, setLayout] = useState(readLayout);
  const data = folder.listing.data;
  const title = data?.folder.isRoot ? "Home" : (data?.folder.name ?? "Home");
  const busy = folder.create.isPending || folder.upload.isPending;
  const backTo =
    data && !data.folder.isRoot
      ? folderOrHome(data.folder.parentId, user?.rootDirId)
      : undefined;

  function changeLayout(next: FolderLayout) {
    localStorage.setItem(layoutKey, next);
    setLayout(next);
  }

  return (
    <>
      <PageCanvas
        title={title}
        backTo={backTo}
        actions={
          <Toolbar
            busy={busy}
            layout={layout}
            onLayoutChange={changeLayout}
            onCreate={(name) => folder.create.mutate(name)}
            onUpload={(files) => folder.upload.mutate(files)}
          />
        }
      >
        {data ? (
          <FolderTrail ancestors={data.ancestors} current={data.folder} />
        ) : null}
        {folder.listing.isPending ? (
          <p className="py-16 text-center text-sm text-muted">Loading…</p>
        ) : null}
        {folder.listing.isError ? (
          <p className="py-16 text-center text-sm text-muted">
            Could not load this folder
          </p>
        ) : null}
        {data ? (
          <ItemGrid
            layout={layout}
            folders={data.folders.items}
            files={data.files.items}
            actions={workspace.actions}
          />
        ) : null}
      </PageCanvas>
      <DriveDialogs workspace={workspace} />
    </>
  );
}

function FolderTrail({
  ancestors,
  current,
}: {
  ancestors: PublicFolder[];
  current: PublicFolder;
}) {
  if (current.isRoot) return null;

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
      <Link className="hover:text-ink" to={paths.home}>
        Home
      </Link>
      {ancestors
        .filter((folder) => !folder.isRoot)
        .map((folder) => (
          <span key={folder.id} className="flex gap-1">
            <span>/</span>
            <Link className="hover:text-ink" to={paths.folder(folder.id)}>
              {folder.name}
            </Link>
          </span>
        ))}
      <span className="flex gap-1 text-ink">
        <span>/</span>
        <span>{current.name}</span>
      </span>
    </nav>
  );
}
