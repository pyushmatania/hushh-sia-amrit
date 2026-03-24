import { ChevronRight } from "lucide-react";

export function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-foreground transition-transform duration-200"
        style={{ transform: `translateX(${enabled ? 20 : 2}px)` }}
      />
    </button>
  );
}

export function SettingRow({ icon: Icon, label, desc, right, onClick, danger }: {
  icon?: React.ComponentType<any>; label: string; desc?: string; right?: React.ReactNode; delay?: number; onClick?: () => void; danger?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-4 border-b border-border last:border-0 ${onClick ? "cursor-pointer active:bg-muted/30 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
        {Icon && <Icon size={16} className={danger ? "text-destructive" : "text-muted-foreground"} />}
        <div>
          <p className={`text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</p>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
      {right || (onClick && <ChevronRight size={16} className="text-muted-foreground" />)}
    </div>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-5 mb-2">{title}</h4>;
}
