import type { InputHTMLAttributes, ReactNode } from "react";
import { ThemeSwitcher } from "../../components/ui/theme-switcher.tsx";
import { BrandMark } from "../../components/ui/brand-mark.tsx";
import { AuthBubbles } from "./AuthBubbles.tsx";

export const authFormClass = "mt-6 space-y-5";

export const authFieldClass =
  "mt-1.5 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20";

export const authSubmitClass =
  "w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-on-primary transition-colors hover:opacity-90 disabled:opacity-60";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate min-h-svh overflow-hidden">
      <img
        src="/login-hero.png"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <AuthBubbles />
      <div className="absolute right-4 top-4 z-20 rounded-full bg-canvas/85 shadow-raise backdrop-blur-sm">
        <ThemeSwitcher />
      </div>
      <div className="relative z-10 flex min-h-svh flex-col justify-end gap-10 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-12 xl:p-16">
        <AuthCopy />
        <AuthCard title={title} subtitle={subtitle}>
          {children}
        </AuthCard>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input id={id} className={authFieldClass} {...props} />
    </div>
  );
}

function AuthCopy() {
  return (
    <div className="max-w-md text-white">
      <div className="hidden lg:block">
        <BrandMark onDark />
      </div>
      <p className="text-xs font-medium uppercase tracking-widest text-white/80 lg:mt-16 lg:text-sm">
        Cloud storage
      </p>
      <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight lg:text-4xl">
        Every file and folder, organized in one place
      </h2>
      <p className="mt-3 hidden text-sm leading-relaxed text-white/80 lg:block">
        Upload, browse, and keep your files in one secure place.
      </p>
    </div>
  );
}

function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-[440px] rounded-2xl bg-canvas/95 p-6 shadow-raise backdrop-blur-md sm:p-8">
      <div className="mb-6 lg:hidden">
        <BrandMark />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
      {children}
    </div>
  );
}
