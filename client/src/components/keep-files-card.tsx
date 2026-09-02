import { Shield } from "lucide-react";
import { paths } from "../utils/paths.ts";
import { ButtonLink } from "./ui/button.tsx";

export function KeepFilesCard() {
  return (
    <section className="overflow-hidden rounded-xl bg-primary-container p-5 shadow-raise">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-canvas text-primary">
        <Shield className="size-5" />
      </div>
      <h2 className="text-sm font-semibold text-on-primary-container">
        Keep your files
      </h2>
      <p className="mt-1 mb-4 text-sm leading-relaxed text-on-primary-container/80">
        This guest drive is temporary. Create an account to keep your files.
      </p>
      <ButtonLink to={paths.register} size="md">
        Create an account
      </ButtonLink>
    </section>
  );
}
