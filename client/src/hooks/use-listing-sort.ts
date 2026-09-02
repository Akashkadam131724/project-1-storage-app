import {
  DEFAULT_LISTING_SORT,
  parseListingSort,
  type ListingSort,
} from "../apis/listing.ts";
import { useLocalPref } from "./use-local-pref.ts";

const sortKey = "storage-sort";

export function readListingSort(): ListingSort {
  const raw = localStorage.getItem(sortKey);
  if (!raw) return DEFAULT_LISTING_SORT;
  try {
    return parseListingSort(JSON.parse(raw) as unknown);
  } catch {
    return DEFAULT_LISTING_SORT;
  }
}

export function useListingSort() {
  const [sort, setSort] = useLocalPref(readListingSort, (next) =>
    localStorage.setItem(sortKey, JSON.stringify(next)),
  );

  return { sort, setSort };
}
