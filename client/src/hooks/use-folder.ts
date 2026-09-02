import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFolder, getFolder } from "../apis/directories.ts";
import { uploadFile } from "../apis/files.ts";
import { toastApiError } from "../utils/api-error.ts";

export const folderKey = (folderId?: string) =>
  ["folder", folderId ?? "root"] as const;

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
