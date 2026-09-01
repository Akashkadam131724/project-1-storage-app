import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFolder, getFolder, trashFolder } from "../apis/directories.ts";
import { trashFile, uploadFile } from "../apis/files.ts";
import { ApiError } from "../apis/http.ts";

export const folderKey = (folderId?: string) =>
  ["folder", folderId ?? "root"] as const;

function toastError(error: unknown) {
  const message =
    error instanceof ApiError ? error.message : "Something went wrong";
  toast.error(message);
}

export function useFolder(folderId?: string) {
  const queryClient = useQueryClient();
  const listing = useQuery({
    queryKey: folderKey(folderId),
    queryFn: () => getFolder(folderId),
  });

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["folder"] }),
      queryClient.invalidateQueries({ queryKey: ["trash"] }),
    ]);

  const create = useMutation({
    mutationFn: (name: string) => createFolder(name, folderId),
    onSuccess: async () => {
      toast.success("Folder created");
      await invalidate();
    },
    onError: toastError,
  });

  const upload = useMutation({
    mutationFn: async (files: FileList) => {
      for (const file of files) {
        await uploadFile(file, folderId);
      }
    },
    onSuccess: async () => {
      toast.success("Upload complete");
      await invalidate();
    },
    onError: toastError,
  });

  const removeFolder = useMutation({
    mutationFn: trashFolder,
    onSuccess: async () => {
      toast.success("Moved to trash");
      await invalidate();
    },
    onError: toastError,
  });

  const removeFile = useMutation({
    mutationFn: trashFile,
    onSuccess: async () => {
      toast.success("Moved to trash");
      await invalidate();
    },
    onError: toastError,
  });

  return { listing, create, upload, removeFolder, removeFile };
}
