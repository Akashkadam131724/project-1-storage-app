import { useEffect, useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePageScroll } from "../../components/ui/page-canvas.tsx";

export function VirtualRows({
  count,
  estimateSize,
  children,
}: {
  count: number;
  estimateSize: number;
  children: (index: number) => ReactNode;
}) {
  const scrollEl = usePageScroll();
  // TanStack Virtual returns unstable function identities by design.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollEl,
    estimateSize: () => estimateSize,
    overscan: 8,
  });

  return (
    <div
      className="relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((item) => (
        <div
          key={item.key}
          data-index={item.index}
          ref={virtualizer.measureElement}
          className="absolute left-0 top-0 w-full"
          style={{ transform: `translateY(${String(item.start)}px)` }}
        >
          {children(item.index)}
        </div>
      ))}
    </div>
  );
}

export function LoadMoreSentinel({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => unknown;
}) {
  const scrollEl = usePageScroll();
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = target.current;
    if (
      !scrollEl ||
      !node ||
      !hasNextPage ||
      !fetchNextPage ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) fetchNextPage();
      },
      { root: scrollEl, rootMargin: "800px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, scrollEl]);

  if (!hasNextPage && !isFetchingNextPage) return null;

  return (
    <div ref={target} className="py-4">
      {isFetchingNextPage ? (
        <p className="text-center text-sm text-muted">Loading more…</p>
      ) : null}
    </div>
  );
}
