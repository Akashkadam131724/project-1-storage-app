import { useState } from "react";
import { Link, useParams } from "react-router";
import { useFolder, flattenFolderPages } from "../../hooks/use-folder.ts";
import { useDriveWorkspace } from "../../hooks/use-drive-workspace.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import type {
  FolderListing,
  PublicFile,
  PublicFolder,
} from "../../apis/types.ts";
import { folderOrHome, paths } from "../../utils/paths.ts";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import type { DriveActions } from "../../hooks/drive-types.ts";
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
  const listing = folder.listing;
  const { head, folders, files } = flattenFolderPages(listing.data);
  const title = head?.folder.isRoot ? "Home" : (head?.folder.name ?? "Home");
  const busy = folder.create.isPending || folder.upload.isPending;
  const backTo =
    head && !head.folder.isRoot
      ? folderOrHome(head.folder.parentId, user?.rootDirId)
      : undefined;

  return (
    <>
      <PageCanvas
        title={title}
        backTo={backTo}
        actions={
          <Toolbar
            busy={busy}
            layout={layout}
            onLayoutChange={(next) => {
              localStorage.setItem(layoutKey, next);
              setLayout(next);
            }}
            onCreate={(name) => folder.create.mutate(name)}
            onUpload={(list) => folder.upload.mutate(list)}
          />
        }
      >
        <FolderBody
          head={head}
          folders={folders}
          files={files}
          layout={layout}
          listing={listing}
          actions={workspace.actions}
        />
      </PageCanvas>
      <DriveDialogs workspace={workspace} />
    </>
  );
}

function FolderBody({
  head,
  folders,
  files,
  layout,
  listing,
  actions,
}: {
  head: FolderListing | undefined;
  folders: PublicFolder[];
  files: PublicFile[];
  layout: FolderLayout;
  listing: ReturnType<typeof useFolder>["listing"];
  actions: DriveActions;
}) {
  return (
    <>
      {head ? (
        <FolderTrail ancestors={head.ancestors} current={head.folder} />
      ) : null}
      {listing.isPending ? (
        <p className="py-16 text-center text-sm text-muted">Loading…</p>
      ) : null}
      {listing.isError ? (
        <p className="py-16 text-center text-sm text-muted">
          Could not load this folder
        </p>
      ) : null}
      {head ? (
        <ItemGrid
          layout={layout}
          folders={folders}
          files={files}
          actions={actions}
          hasNextPage={listing.hasNextPage}
          isFetchingNextPage={listing.isFetchingNextPage}
          fetchNextPage={listing.fetchNextPage}
        />
      ) : null}
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
