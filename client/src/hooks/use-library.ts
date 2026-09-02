import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getRecent, getStarred, getTrash } from "../apis/library.ts";
import {
  DEFAULT_LISTING_SORT,
  nextListingPage,
  nextPagedPage,
  toDriveItems,
  type ListingSort,
} from "../apis/listing.ts";
import type {
  DriveItem,
  LibraryListing,
  Paginated,
  PublicFile,
} from "../apis/types.ts";

export function flattenLibraryPages(data?: InfiniteData<LibraryListing>) {
  if (!data) return { folders: [], files: [], items: undefined };
  return {
    folders: data.pages.flatMap((page) => page.folders.items),
    files: data.pages.flatMap((page) => page.files.items),
    items: mixedItems(data.pages),
  };
}

export function flattenRecentPages(data?: InfiniteData<Paginated<PublicFile>>) {
  return data?.pages.flatMap((page) => page.items) ?? [];
}

export function useTrash(sort: ListingSort = DEFAULT_LISTING_SORT) {
  return useInfiniteQuery({
    queryKey: ["trash", sort],
    queryFn: ({ pageParam }) => getTrash(pageParam, sort),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      nextListingPage(last.folders, last.files, last.entries),
  });
}

export function useStarred(sort: ListingSort = DEFAULT_LISTING_SORT) {
  return useInfiniteQuery({
    queryKey: ["starred", sort],
    queryFn: ({ pageParam }) => getStarred(pageParam, sort),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      nextListingPage(last.folders, last.files, last.entries),
  });
}

export function useRecent(sort: ListingSort = DEFAULT_LISTING_SORT) {
  return useInfiniteQuery({
    queryKey: ["recent", sort],
    queryFn: ({ pageParam }) => getRecent(pageParam, sort),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPagedPage(last),
  });
}

function mixedItems(pages: LibraryListing[]): DriveItem[] | undefined {
  if (pages[0]?.entries == null) return undefined;
  return pages.flatMap((page) => toDriveItems(page.entries?.items ?? []));
}
