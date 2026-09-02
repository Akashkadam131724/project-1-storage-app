import { useParams } from "react-router";
import { useFolder, flattenFolderPages } from "../../hooks/use-folder.ts";
import { useDriveWorkspace } from "../../hooks/use-drive-workspace.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import type {
  DriveItem,
  FolderListing,
  PublicFile,
  PublicFolder,
} from "../../apis/types.ts";
import type { ListingSort } from "../../apis/listing.ts";
import { folderOrHome } from "../../utils/paths.ts";
import { FolderTrail } from "../../components/ui/folder-trail.tsx";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { StatusMessage } from "../../components/ui/status-message.tsx";
import type { DriveActions } from "../../hooks/drive-types.ts";
import {
  useFolderLayout,
  type FolderLayout,
} from "../../hooks/use-folder-layout.ts";
import { useListingSort } from "../../hooks/use-listing-sort.ts";
import { DriveDialogs } from "./DriveDialogs.tsx";
import { ItemGrid } from "./ItemGrid.tsx";
import { Toolbar } from "./Toolbar.tsx";

export function DirectoryPage() {
  const { user } = useAuth();
  const { folderId } = useParams();
  const { sort, setSort } = useListingSort();
  const folder = useFolder(folderId, sort);
  const workspace = useDriveWorkspace();
  const { layout, setLayout } = useFolderLayout();
  const listing = folder.listing;
  const { head, folders, files, items } = flattenFolderPages(listing.data);
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
            onLayoutChange={setLayout}
            sort={sort}
            onSortChange={setSort}
            onCreate={(name) => folder.create.mutate(name)}
            onUpload={(list) => folder.upload.mutate(list)}
          />
        }
      >
        <FolderBody
          head={head}
          folders={folders}
          files={files}
          items={items}
          layout={layout}
          listing={listing}
          sort={sort}
          onSortChange={setSort}
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
  items,
  layout,
  listing,
  sort,
  onSortChange,
  actions,
}: {
  head: FolderListing | undefined;
  folders: PublicFolder[];
  files: PublicFile[];
  items?: DriveItem[];
  layout: FolderLayout;
  listing: ReturnType<typeof useFolder>["listing"];
  sort: ListingSort;
  onSortChange: (sort: ListingSort) => void;
  actions: DriveActions;
}) {
  return (
    <>
      {head ? (
        <FolderTrail ancestors={head.ancestors} current={head.folder} />
      ) : null}
      {listing.isPending ? <StatusMessage>Loading…</StatusMessage> : null}
      {listing.isError ? (
        <StatusMessage>Could not load this folder</StatusMessage>
      ) : null}
      {head ? (
        <ItemGrid
          layout={layout}
          folders={folders}
          files={files}
          items={items}
          sort={sort}
          onSortChange={onSortChange}
          actions={actions}
          hasNextPage={listing.hasNextPage}
          isFetchingNextPage={listing.isFetchingNextPage}
          fetchNextPage={listing.fetchNextPage}
        />
      ) : null}
    </>
  );
}
