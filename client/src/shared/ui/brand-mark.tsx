export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-canvas shadow-raise">
        <svg
          className="text-primary"
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
      {compact ? null : (
        <span className="text-lg font-medium text-ink">Storage</span>
      )}
    </div>
  );
}
