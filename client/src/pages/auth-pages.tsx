import { Link } from "react-router";
import { paths } from "../app/paths.ts";
import { ThemeSwitcher } from "../shared/theme/theme-switcher.tsx";
import { BrandMark } from "../shared/ui/brand-mark.tsx";

type Props = {
  title: string;
  submitLabel: string;
  altHref: string;
  altLabel: string;
};

function AuthCard({ title, submitLabel, altHref, altLabel }: Props) {
  return (
    <div className="relative flex min-h-svh items-center justify-center bg-chrome p-4">
      <div className="absolute right-3 top-3">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-canvas p-8 shadow-raise">
        <BrandMark />
        <h1 className="mt-6 text-2xl font-medium text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">
          Design only — not connected yet.
        </p>
        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            className="w-full rounded-xl border border-line bg-search px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Email"
            type="email"
          />
          <input
            className="w-full rounded-xl border border-line bg-search px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Password"
            type="password"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-on-primary"
          >
            {submitLabel}
          </button>
        </form>
        <Link className="mt-4 inline-block text-sm text-primary" to={altHref}>
          {altLabel}
        </Link>
      </div>
    </div>
  );
}

export function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      submitLabel="Sign in"
      altHref={paths.register}
      altLabel="Create an account"
    />
  );
}

export function RegisterPage() {
  return (
    <AuthCard
      title="Create account"
      submitLabel="Create account"
      altHref={paths.login}
      altLabel="Already have an account? Sign in"
    />
  );
}
