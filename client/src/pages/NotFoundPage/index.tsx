import { Link } from "react-router";
import { paths } from "../../utils/paths.ts";

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-chrome px-6 text-center">
      <h1 className="text-2xl font-medium text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted">That route does not exist yet.</p>
      <Link className="mt-6 text-sm font-medium text-primary" to={paths.home}>
        Back to Home
      </Link>
    </main>
  );
}
