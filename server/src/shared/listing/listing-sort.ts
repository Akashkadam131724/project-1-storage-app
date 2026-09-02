import type { ListingContext, ListingQuery, SortBy } from "./listing-query.js";

export type MongoSort = Record<string, 1 | -1>;

export type SortableDoc = {
  _id: { toString(): string };
  name: string;
  updatedAt: Date;
  lastOpenedAt?: Date | null;
  trashedAt?: Date | null;
  starredAt?: Date | null;
};

export type MixedDoc<F extends SortableDoc, I extends SortableDoc> =
  { type: "folder"; item: F } | { type: "file"; item: I };

const NAME_COLLATION = { locale: "en", strength: 2 } as const;

export function mongoSortFor(
  kind: "folder" | "file",
  listing: ListingQuery,
  context: ListingContext,
): MongoSort {
  const dir = listing.sortDir === "asc" ? 1 : -1;
  const sortBy = effectiveSortBy(listing, context);

  if (!sortBy) {
    if (context === "starred") return { starredAt: dir, name: 1 };
    if (context === "trash") return { trashedAt: dir, name: 1 };
    if (context === "recent") return { lastOpenedAt: dir, name: 1 };
    return { name: dir };
  }

  if (sortBy === "name") {
    return { name: dir, _id: 1 };
  }

  if (sortBy === "modified") {
    if (context === "trash") return { trashedAt: dir, name: 1 };
    return { updatedAt: dir, name: 1 };
  }

  if (kind === "folder") {
    return { updatedAt: dir, name: 1 };
  }
  return { lastOpenedAt: dir, name: 1 };
}

export function applyListingSort<
  Q extends { sort(spec: MongoSort): Q; collation(spec: object): Q },
>(
  query: Q,
  kind: "folder" | "file",
  listing: ListingQuery,
  context: ListingContext,
): Q {
  const sorted = query.sort(mongoSortFor(kind, listing, context));
  if (usesNameSort(listing, context)) {
    return sorted.collation(NAME_COLLATION);
  }
  return sorted;
}

export function compareSortable(
  a: SortableDoc,
  b: SortableDoc,
  listing: ListingQuery,
  context: ListingContext,
) {
  const dir = listing.sortDir === "asc" ? 1 : -1;
  const av = sortKey(a, listing, context);
  const bv = sortKey(b, listing, context);
  if (av < bv) return -1 * dir;
  if (av > bv) return 1 * dir;
  const byName = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  if (byName !== 0) return byName;
  return a._id.toString().localeCompare(b._id.toString());
}

export function mergeListingDocs<F extends SortableDoc, I extends SortableDoc>(
  folders: F[],
  files: I[],
  listing: ListingQuery,
  context: ListingContext,
): MixedDoc<F, I>[] {
  return [
    ...folders.map((item) => ({ type: "folder" as const, item })),
    ...files.map((item) => ({ type: "file" as const, item })),
  ].sort((left, right) =>
    compareSortable(left.item, right.item, listing, context),
  );
}

function effectiveSortBy(
  listing: ListingQuery,
  context: ListingContext,
): SortBy | undefined {
  if (listing.sortBy) return listing.sortBy;
  if (context === "children") return "name";
  if (context === "recent") return "opened";
  if (context === "trash") return "modified";
  return undefined;
}

function usesNameSort(listing: ListingQuery, context: ListingContext) {
  return effectiveSortBy(listing, context) === "name";
}

function sortKey(
  item: SortableDoc,
  listing: ListingQuery,
  context: ListingContext,
): string | number {
  switch (effectiveSortBy(listing, context)) {
    case "name":
      return item.name.toLocaleLowerCase("en");
    case "modified":
      return timestamp(context === "trash" ? item.trashedAt : item.updatedAt);
    case "opened":
      return item.lastOpenedAt?.getTime() ?? item.updatedAt.getTime();
    default:
      return timestamp(item.starredAt);
  }
}

function timestamp(value: Date | null | undefined) {
  return value?.getTime() ?? 0;
}
