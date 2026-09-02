import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  copyFolder,
  moveFolder,
  purgeFolder,
  renameFolder,
  restoreFolder,
  setFolderStar,
  trashFolder,
} from "../apis/directories.ts";
import {
  copyFile,
  moveFile,
  purgeFile,
  renameFile,
  restoreFile,
  setFileStar,
  trashFile,
} from "../apis/files.ts";
import { toastApiError } from "../utils/api-error.ts";
import type { ItemRef } from "./drive-types.ts";

export type RenameInput = ItemRef & { name: string };
export type StarInput = ItemRef & { starred: boolean };
export type RelocateInput = ItemRef & { parentId: string };

export function useDriveActions() {
  const invalidate = useInvalidateDrive();
  const rename = useEditMutation(invalidate);
  const star = useStarMutation(invalidate);
  const place = usePlaceMutations(invalidate);
  return { rename, star, ...place };
}

function useInvalidateDrive() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["folder"] }),
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] }),
      queryClient.invalidateQueries({ queryKey: ["trash"] }),
      queryClient.invalidateQueries({ queryKey: ["starred"] }),
      queryClient.invalidateQueries({ queryKey: ["recent"] }),
      queryClient.invalidateQueries({ queryKey: ["file"] }),
    ]);
}

function useEditMutation(invalidate: () => Promise<unknown[]>) {
  return useMutation({
    mutationFn: async (input: RenameInput) => {
      if (input.kind === "folder") await renameFolder(input.id, input.name);
      else await renameFile(input.id, input.name);
    },
    ...driveResult("Renamed", invalidate),
  });
}

function useStarMutation(invalidate: () => Promise<unknown[]>) {
  return useMutation({
    mutationFn: async (input: StarInput) => {
      if (input.kind === "folder") {
        await setFolderStar(input.id, input.starred);
      } else {
        await setFileStar(input.id, input.starred);
      }
    },
    onSuccess: async (_data, input) => {
      toast.success(input.starred ? "Starred" : "Removed from starred");
      await invalidate();
    },
    onError: (error: unknown) => toastApiError(error),
  });
}

function usePlaceMutations(invalidate: () => Promise<unknown[]>) {
  const opts = (message: string) => driveResult(message, invalidate);
  const move = useMutation({
    mutationFn: async (input: RelocateInput) => {
      if (input.kind === "folder") {
        await moveFolder(input.id, input.parentId);
      } else {
        await moveFile(input.id, input.parentId);
      }
    },
    ...opts("Moved"),
  });
  const copy = useMutation({
    mutationFn: async (input: RelocateInput) => {
      if (input.kind === "folder") {
        await copyFolder(input.id, input.parentId);
      } else {
        await copyFile(input.id, input.parentId);
      }
    },
    ...opts("Copied"),
  });
  const trash = useMutation({
    mutationFn: async (input: ItemRef) => {
      if (input.kind === "folder") await trashFolder(input.id);
      else await trashFile(input.id);
    },
    ...opts("Moved to trash"),
  });
  const restore = useMutation({
    mutationFn: async (input: ItemRef) => {
      if (input.kind === "folder") await restoreFolder(input.id);
      else await restoreFile(input.id);
    },
    ...opts("Restored"),
  });
  const purge = useMutation({
    mutationFn: async (input: ItemRef) => {
      if (input.kind === "folder") await purgeFolder(input.id);
      else await purgeFile(input.id);
    },
    ...opts("Deleted forever"),
  });
  return { move, copy, trash, restore, purge };
}

function driveResult(message: string, invalidate: () => Promise<unknown[]>) {
  return {
    onSuccess: async () => {
      toast.success(message);
      await invalidate();
    },
    onError: (error: unknown) => toastApiError(error),
  };
}
