/**
 * DemoDataBanner — small persistent indicator shown when a page is displaying mock/demo data
 * instead of real Supabase data. Helps admins know what's real vs placeholder.
 */
export default function DemoDataBanner({ entityName }: { entityName?: string }) {
  return (
    <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
      <p className="text-[11px] text-amber-300 font-medium">
        Showing sample {entityName || "data"} — real data will appear once {entityName || "records"} are created
      </p>
    </div>
  );
}
