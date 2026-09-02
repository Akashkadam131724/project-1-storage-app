type Props = {
  className?: string;
};

export function StorageHero({ className }: Props) {
  return (
    <img
      src="/login-hero.png"
      alt=""
      className={["size-full object-cover object-left", className]
        .filter(Boolean)
        .join(" ")}
      style={{ filter: "var(--hero-filter)" }}
    />
  );
}
