import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createFolder, getFolder } from "../apis/directories.ts";
import { uploadFile } from "../apis/files.ts";
import {
  DEFAULT_LISTING_SORT,
  mixedItemsFromPages,
  nextListingPage,
  type ListingSort,
} from "../apis/listing.ts";
import type { FolderListing } from "../apis/types.ts";
import { toastApiError } from "../utils/api-error.ts";

export const folderKey = (folderId?: string, sort?: ListingSort) =>
  ["folder", folderId ?? "root", sort ?? DEFAULT_LISTING_SORT] as const;

export function flattenFolderPages(data?: InfiniteData<FolderListing>) {
  if (!data) {
    return { head: undefined, folders: [], files: [], items: undefined };
  }
  return {
    head: data.pages[0],
    folders: data.pages.flatMap((page) => page.folders.items),
    files: data.pages.flatMap((page) => page.files.items),
    items: mixedItemsFromPages(data.pages),
  };
}

export function useFolderListing(
  folderId?: string,
  sort: ListingSort = DEFAULT_LISTING_SORT,
) {
  return useInfiniteQuery({
    queryKey: folderKey(folderId, sort),
    queryFn: ({ pageParam }) => getFolder(folderId, pageParam, sort),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      nextListingPage(last.folders, last.files, last.entries),
  });
}

export function useFolder(
  folderId?: string,
  sort: ListingSort = DEFAULT_LISTING_SORT,
) {
  const queryClient = useQueryClient();
  const listing = useFolderListing(folderId, sort);

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["folder"] }),
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] }),
      queryClient.invalidateQueries({ queryKey: ["trash"] }),
    ]);

  const create = useMutation({
    mutationFn: (name: string) => createFolder(name, folderId),
    onSuccess: async () => {
      toast.success("Folder created");
      await invalidate();
    },
    onError: (error: unknown) => toastApiError(error),
  });

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        await uploadFile(file, folderId);
      }
    },
    onSuccess: async () => {
      toast.success("Upload complete");
      await invalidate();
    },
    onError: (error: unknown) => toastApiError(error),
  });

  return { listing, create, upload };
}
