import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getRecent, getStarred, getTrash } from "../apis/library.ts";
import { nextListingPage, nextPagedPage } from "../apis/listing.ts";
import type { LibraryListing, Paginated, PublicFile } from "../apis/types.ts";

export function flattenLibraryPages(data?: InfiniteData<LibraryListing>) {
  if (!data) return { folders: [], files: [] };
  return {
    folders: data.pages.flatMap((page) => page.folders.items),
    files: data.pages.flatMap((page) => page.files.items),
  };
}

export function flattenRecentPages(data?: InfiniteData<Paginated<PublicFile>>) {
  return data?.pages.flatMap((page) => page.items) ?? [];
}

export function useTrash() {
  return useInfiniteQuery({
    queryKey: ["trash"],
    queryFn: ({ pageParam }) => getTrash(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => nextListingPage(last.folders, last.files),
  });
}

export function useStarred() {
  return useInfiniteQuery({
    queryKey: ["starred"],
    queryFn: ({ pageParam }) => getStarred(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => nextListingPage(last.folders, last.files),
  });
}

export function useRecent() {
  return useInfiniteQuery({
    queryKey: ["recent"],
    queryFn: ({ pageParam }) => getRecent(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPagedPage(last),
  });
}
