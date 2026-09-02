import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id?: string;
  label?: ReactNode;
  labelClass?: string;
  fill?: "search" | "canvas";
  shape?: "rounded" | "pill";
};

export function TextField({
  id,
  label,
  labelClass = "font-medium text-muted",
  fill = "search",
  shape = "rounded",
  className,
  ...props
}: Props) {
  const field = (
    <input
      id={id}
      className={[
        "w-full border border-line px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20",
        fill === "search" ? "bg-search" : "bg-canvas",
        shape === "pill" ? "rounded-full px-3 py-1.5" : "rounded-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );

  if (!label) return field;

  return (
    <label className="block text-sm" htmlFor={id}>
      <span className={labelClass}>{label}</span>
      <span className="mt-1.5 block">{field}</span>
    </label>
  );
}
