import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { roadmapItems, type RoadmapItem } from "./items.ts";

const currentId = roadmapItems.find((item) => !item.done)?.id;

export function RoadmapPage() {
  const { user } = useAuth();
  const finished = roadmapItems.filter((item) => item.done).length;
  const total = roadmapItems.length;

  return (
    <PageCanvas title="Roadmap" back={Boolean(user)}>
      <p className="mb-2 max-w-2xl text-sm leading-relaxed text-muted">
        Public build order: what is already shipped, then what is next. Local
        first, then production, then the next feature. Checkboxes are not
        clickable.
      </p>
      <p className="mb-8 text-sm font-medium text-ink">
        {String(finished)} of {String(total)} done
      </p>
      <ul className="max-w-2xl space-y-1">
        {roadmapItems.map((item) => (
          <RoadmapRow
            key={item.id}
            item={item}
            current={item.id === currentId}
          />
        ))}
      </ul>
    </PageCanvas>
  );
}

function RoadmapRow({
  item,
  current,
}: {
  item: RoadmapItem;
  current: boolean;
}) {
  return (
    <li>
      <label className="flex items-start gap-3 rounded-lg px-2 py-3">
        <input
          type="checkbox"
          className="mt-1 size-4 shrink-0 accent-primary"
          checked={item.done}
          disabled
          readOnly
          tabIndex={-1}
        />
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2">
            {current ? (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                Now
              </span>
            ) : null}
            <span
              className={[
                "text-sm font-medium",
                item.done ? "text-muted line-through" : "text-ink",
              ].join(" ")}
            >
              {item.title}
            </span>
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted">
            {item.detail}
          </span>
        </span>
      </label>
    </li>
  );
}
