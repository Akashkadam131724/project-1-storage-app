export function BrandMark({
  compact = false,
  onDark = false,
}: {
  compact?: boolean;
  onDark?: boolean;
}) {
  const frame = onDark
    ? "flex size-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm"
    : "flex size-9 items-center justify-center rounded-xl bg-canvas shadow-raise";
  const icon = onDark ? "text-white" : "text-primary";
  const name = onDark
    ? "text-lg font-semibold tracking-tight text-white"
    : "text-lg font-medium text-ink";

  return (
    <div className="flex items-center gap-2.5">
      <div className={frame}>
        <svg
          className={icon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            d="M19.36 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.36 10.04Z"
            fill="currentColor"
          />
        </svg>
      </div>
      {compact ? null : <span className={name}>Storage</span>}
    </div>
  );
}
