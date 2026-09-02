export function UserAvatar({
  name,
  picture,
  size,
}: {
  name: string;
  picture?: string;
  size: "sm" | "lg" | "xl";
}) {
  const box =
    size === "xl"
      ? "size-24 text-3xl"
      : size === "lg"
        ? "size-16 text-xl"
        : "size-8 text-sm";
  if (picture) {
    return (
      <img
        src={picture}
        alt=""
        className={`${box} rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      className={`flex ${box} items-center justify-center rounded-full bg-primary font-medium text-on-primary`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
