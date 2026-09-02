import { Check } from "lucide-react";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { useTheme } from "../../contexts/theme/theme-context.ts";
import { themes, themesById } from "../../contexts/theme/themes.ts";
import { ThemePicker } from "../../components/ui/theme-picker.tsx";

export function AppearancePage() {
  const { theme } = useTheme();
  const current = themesById[theme];
  const lightCount = themes.filter((option) => !option.isDark).length;
  const darkCount = themes.length - lightCount;

  return (
    <PageCanvas title="Appearance" back>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
        Choose a look for Storage. It is saved on this device.
      </p>
      <div className="mb-8 flex items-center gap-4 rounded-xl border border-line bg-canvas p-5 shadow-raise">
        <span
          className="flex size-16 overflow-hidden rounded-lg ring-1 ring-line"
          style={{ background: current.chrome }}
          aria-hidden
        >
          <span className="w-1/2" style={{ background: current.canvas }} />
          <span className="w-1/2" style={{ background: current.primary }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Current look
          </p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {current.name}
          </p>
          <p className="text-sm text-muted">
            {lightCount} light · {darkCount} dark palettes
          </p>
        </div>
        <Check className="size-5 shrink-0 text-primary" aria-hidden />
      </div>
      <ThemePicker variant="page" />
    </PageCanvas>
  );
}
