import { Check } from "lucide-react";
import { useTheme } from "../../contexts/theme/theme-context.ts";
import { themes, type ThemeOption } from "../../contexts/theme/themes.ts";

export function ThemePicker({
  variant,
  onPick,
}: {
  variant: "menu" | "page";
  onPick?: () => void;
}) {
  const { theme, setTheme } = useTheme();

  function pick(id: ThemeOption["id"]) {
    setTheme(id);
    onPick?.();
  }

  if (variant === "menu") {
    return (
      <div className="grid grid-cols-1 gap-1">
        {themes.map((option) => (
          <ThemeChoice
            key={option.id}
            option={option}
            selected={theme === option.id}
            onSelect={() => pick(option.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ThemeGroup
        title="Light"
        options={themes.filter((option) => !option.isDark)}
        selected={theme}
        onPick={pick}
      />
      <ThemeGroup
        title="Dark"
        options={themes.filter((option) => option.isDark)}
        selected={theme}
        onPick={pick}
      />
    </div>
  );
}

function ThemeGroup({
  title,
  options,
  selected,
  onPick,
}: {
  title: string;
  options: ThemeOption[];
  selected: ThemeOption["id"];
  onPick: (id: ThemeOption["id"]) => void;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
        {options.map((option) => (
          <ThemeCard
            key={option.id}
            option={option}
            selected={selected === option.id}
            onSelect={() => onPick(option.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ThemeChoice({
  option,
  selected,
  onSelect,
}: {
  option: ThemeOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        "flex items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors",
        selected
          ? "bg-primary-container font-medium text-on-primary-container"
          : "text-ink hover:bg-chrome",
      ].join(" ")}
      onClick={onSelect}
    >
      <ThemeSwatch option={option} className="size-8" />
      {option.name}
    </button>
  );
}

function ThemeCard({
  option,
  selected,
  onSelect,
}: {
  option: ThemeOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        "group relative rounded-xl border p-3 text-left transition",
        selected
          ? "border-primary bg-primary-container/30 shadow-raise"
          : "border-line bg-canvas hover:border-primary/40 hover:shadow-raise",
      ].join(" ")}
      onClick={onSelect}
    >
      {selected ? (
        <span className="absolute right-4 top-4 z-10 flex size-6 items-center justify-center rounded-full bg-primary text-on-primary">
          <Check className="size-3.5" />
        </span>
      ) : null}
      <ThemePreview option={option} />
      <p className="mt-3 px-1 text-sm font-semibold text-ink">{option.name}</p>
      <p className="px-1 text-xs text-muted">
        {selected ? "Current theme" : option.isDark ? "Dark" : "Light"}
      </p>
    </button>
  );
}

function ThemePreview({ option }: { option: ThemeOption }) {
  return (
    <div
      className="overflow-hidden rounded-lg ring-1 ring-line"
      style={{ background: option.chrome }}
    >
      <div className="flex items-center gap-1 px-3 py-2">
        <span className="size-1.5 rounded-full bg-black/25" />
        <span className="size-1.5 rounded-full bg-black/25" />
        <span className="size-1.5 rounded-full bg-black/25" />
      </div>
      <div className="mx-2 mb-2 flex overflow-hidden rounded-xl">
        <span
          className="w-9 shrink-0 py-10"
          style={{ background: option.primary, opacity: 0.2 }}
        />
        <span className="flex-1 p-3" style={{ background: option.canvas }}>
          <span
            className="mb-2 block h-2 w-16 rounded-full"
            style={{ background: option.primary }}
          />
          <span
            className="block h-2 w-24 rounded-full"
            style={{ background: option.primary, opacity: 0.35 }}
          />
        </span>
      </div>
    </div>
  );
}

function ThemeSwatch({
  option,
  className,
}: {
  option: ThemeOption;
  className: string;
}) {
  return (
    <span
      className={`flex overflow-hidden rounded-full ring-1 ring-line ${className}`}
      style={{ background: option.chrome }}
      aria-hidden
    >
      <span className="w-1/2" style={{ background: option.canvas }} />
      <span className="w-1/2" style={{ background: option.primary }} />
    </span>
  );
}
