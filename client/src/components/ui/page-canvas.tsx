import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { paths } from "../../utils/paths.ts";
import { IconButton, IconLink } from "./icon-button.tsx";

const PageScrollContext = createContext<HTMLDivElement | null>(null);

export function usePageScroll() {
  return useContext(PageScrollContext);
}

type Props = {
  title: string;
  back?: boolean;
  backTo?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PageCanvas({ title, back, backTo, actions, children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    setScrollEl(scrollRef.current);
  }, []);

  return (
    <section className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas lg:mb-3 lg:mr-3 lg:rounded-2xl lg:shadow-raise">
      <header className="flex items-center justify-between gap-3 px-3 pb-3 pt-4 lg:px-7 lg:pt-8">
        <div className="flex min-w-0 items-center gap-0.5">
          {back ? <HistoryBack fallback={backTo ?? paths.home} /> : null}
          {!back && backTo ? (
            <IconLink label="Back" to={backTo}>
              <ArrowLeft className="size-5" />
            </IconLink>
          ) : null}
          <h1 className="min-w-0 truncate text-base font-medium text-ink">
            {title}
          </h1>
        </div>
        {actions}
      </header>
      <PageScrollContext.Provider value={scrollEl}>
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-20 lg:px-8 lg:pb-8"
        >
          {children}
        </div>
      </PageScrollContext.Provider>
    </section>
  );
}

function HistoryBack({ fallback }: { fallback: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  function goBack() {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    const hasSessionHistory =
      typeof idx === "number" ? idx > 0 : location.key !== "default";
    if (hasSessionHistory) {
      void navigate(-1);
      return;
    }
    void navigate(fallback);
  }

  return (
    <IconButton label="Back" onClick={goBack}>
      <ArrowLeft className="size-5" />
    </IconButton>
  );
}
