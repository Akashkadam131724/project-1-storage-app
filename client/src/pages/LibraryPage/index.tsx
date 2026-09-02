import type { LucideIcon } from "lucide-react";
import { Clock, Star, Trash2 } from "lucide-react";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import type { DriveMode } from "../../hooks/drive-types.ts";
import { useDriveWorkspace } from "../../hooks/use-drive-workspace.ts";
import {
  flattenLibraryPages,
  flattenRecentPages,
  useRecent,
  useStarred,
  useTrash,
} from "../../hooks/use-library.ts";
import { DriveDialogs } from "../DirectoryPage/DriveDialogs.tsx";
import { ItemGrid } from "../DirectoryPage/ItemGrid.tsx";
import { ListingControls } from "../DirectoryPage/Toolbar.tsx";
import { useFolderLayout } from "../../hooks/use-folder-layout.ts";
import { useListingSort } from "../../hooks/use-listing-sort.ts";
import { paths } from "../../utils/paths.ts";
import type { DriveItem, PublicFile, PublicFolder } from "../../apis/types.ts";
import type { ListingSort } from "../../apis/listing.ts";

export function TrashPage() {
  const { sort, setSort } = useListingSort();
  const query = useTrash(sort);
  const { folders, files, items } = flattenLibraryPages(query.data);
  return (
    <LibraryCanvas
      title="Trash"
      icon={Trash2}
      mode="trash"
      empty="Trash is empty"
      hint="Deleted files will appear here"
      loading={query.isPending}
      folders={folders}
      files={files}
      items={items}
      sort={sort}
      onSortChange={setSort}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={query.fetchNextPage}
    />
  );
}

export function StarredPage() {
  const { sort, setSort } = useListingSort();
  const query = useStarred(sort);
  const { folders, files, items } = flattenLibraryPages(query.data);
  return (
    <LibraryCanvas
      title="Starred"
      icon={Star}
      mode="starred"
      empty="No starred items"
      hint="Star files and folders to find them quickly"
      loading={query.isPending}
      folders={folders}
      files={files}
      items={items}
      sort={sort}
      onSortChange={setSort}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={query.fetchNextPage}
    />
  );
}

export function RecentPage() {
  const { sort, setSort } = useListingSort();
  const query = useRecent(sort);
  return (
    <LibraryCanvas
      title="Recent"
      icon={Clock}
      mode="recent"
      empty="No recent files"
      hint="Files you open will show up here"
      loading={query.isPending}
      folders={[]}
      files={flattenRecentPages(query.data)}
      sort={sort}
      onSortChange={setSort}
      showFolders={false}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPage={query.fetchNextPage}
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
  items,
  sort,
  onSortChange,
  showFolders = true,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  title: string;
  icon: LucideIcon;
  mode: DriveMode;
  empty: string;
  hint: string;
  loading: boolean;
  folders: PublicFolder[];
  files: PublicFile[];
  items?: DriveItem[];
  sort: ListingSort;
  onSortChange: (sort: ListingSort) => void;
  showFolders?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
}) {
  const workspace = useDriveWorkspace();
  const { layout, setLayout } = useFolderLayout();
  const isEmpty = !loading && folders.length === 0 && files.length === 0;

  return (
    <>
      <PageCanvas
        title={title}
        backTo={paths.home}
        actions={
          <ListingControls
            layout={layout}
            onLayoutChange={setLayout}
            sort={sort}
            onSortChange={onSortChange}
            showFolders={showFolders}
          />
        }
      >
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
            layout={layout}
            folders={folders}
            files={files}
            items={items}
            sort={sort}
            onSortChange={onSortChange}
            mode={mode}
            actions={workspace.actions}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
      </PageCanvas>
      <DriveDialogs workspace={workspace} />
    </>
  );
}
