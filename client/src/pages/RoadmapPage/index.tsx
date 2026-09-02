import { useMemo, useState } from "react";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import {
  leftoverItems,
  leftoverSections,
  shippedItems,
  type RoadmapSection,
} from "./items.ts";

const storageKey = "storage-roadmap";

function readDone(): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((id) => typeof id === "string")
        : [],
    );
  } catch {
    return new Set();
  }
}

function writeDone(ids: Set<string>) {
  localStorage.setItem(storageKey, JSON.stringify([...ids]));
}

export function RoadmapPage() {
  const [done, setDone] = useState(readDone);
  const remaining = leftoverItems.length - done.size;
  const percent = Math.round((done.size / leftoverItems.length) * 100);
  const summary = useMemo(
    () =>
      remaining === 0
        ? "Everything on this list is checked off on this device."
        : `${String(remaining)} left · ${String(done.size)} done`,
    [done.size, remaining],
  );

  function toggle(id: string) {
    setDone((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeDone(next);
      return next;
    });
  }

  return (
    <PageCanvas title="Roadmap" back>
      <p className="mb-2 max-w-2xl text-sm leading-relaxed text-muted">
        Do the first cloud deploy before more product work, so DevOps is not
        left until the end. After that slice is live, continue with S3, search,
        and the rest. Check items off as you finish them. The list is saved on
        this device.
      </p>
      <p className="mb-6 text-sm font-medium text-ink">{summary}</p>
      <div className="mb-8 h-2 max-w-xl rounded-full bg-line">
        <div
          className="h-2 rounded-full bg-primary transition-[width]"
          style={{ width: `${String(percent)}%` }}
        />
      </div>
      <SectionGrid done={done} onToggle={toggle} />
      <ShippedList />
    </PageCanvas>
  );
}

function SectionGrid({
  done,
  onToggle,
}: {
  done: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {leftoverSections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          done={done}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function SectionCard({
  section,
  done,
  onToggle,
}: {
  section: RoadmapSection;
  done: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="rounded-xl border border-line bg-canvas shadow-raise">
      <header className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">{section.title}</h2>
      </header>
      <ul className="divide-y divide-line">
        {section.items.map((item) => {
          const checked = done.has(item.id);
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 px-5 py-4 hover:bg-chrome/50">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-primary"
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                />
                <span className="min-w-0">
                  <span
                    className={[
                      "block text-sm font-medium",
                      checked ? "text-muted line-through" : "text-ink",
                    ].join(" ")}
                  >
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {item.detail}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ShippedList() {
  return (
    <section className="mt-8 rounded-xl border border-line bg-canvas p-5 shadow-raise">
      <h2 className="mb-3 text-sm font-semibold text-ink">Already in place</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {shippedItems.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted">
            <span className="mt-0.5 text-primary" aria-hidden>
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
