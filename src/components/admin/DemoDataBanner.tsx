/**
 * DemoDataBanner — persistent indicator shown when a page is displaying mock/demo data.
 * In real mode, shows a green "Live Data" indicator instead.
 */
import { useAppConfig } from "@/hooks/use-app-config";

export default function DemoDataBanner({ entityName }: { entityName?: string }) {
  const config = useAppConfig();
  const isRealMode = config.data_mode === "real";

  if (isRealMode) {
    return (
      <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        <p className="text-[11px] text-emerald-400 font-medium">
          Live mode — showing real {entityName || "data"}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <p className="text-[11px] text-amber-300 font-medium">
        Showing sample {entityName || "data"} — real data will appear once {entityName || "records"} are created
      </p>
    </div>
  );
}
