import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { createFolder, getFolder } from "../apis/directories.ts";
import { uploadFile } from "../apis/files.ts";
import { nextListingPage } from "../apis/listing.ts";
import type { FolderListing } from "../apis/types.ts";
import { toastApiError } from "../utils/api-error.ts";

export const folderKey = (folderId?: string) =>
  ["folder", folderId ?? "root"] as const;

export function flattenFolderPages(data?: InfiniteData<FolderListing>) {
  if (!data) return { head: undefined, folders: [], files: [] };
  return {
    head: data.pages[0],
    folders: data.pages.flatMap((page) => page.folders.items),
    files: data.pages.flatMap((page) => page.files.items),
  };
}

export function useFolderListing(folderId?: string) {
  return useInfiniteQuery({
    queryKey: folderKey(folderId),
    queryFn: ({ pageParam }) => getFolder(folderId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => nextListingPage(last.folders, last.files),
  });
}

export function useFolder(folderId?: string) {
  const queryClient = useQueryClient();
  const listing = useFolderListing(folderId);

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
