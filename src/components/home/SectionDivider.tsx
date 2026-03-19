interface SectionDividerProps {
  title: string;
}

export default function SectionDivider({ title }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-6">
      <div className="flex-1 border-t border-dashed border-foreground/[0.12]" />
      <span className="text-[12px] font-semibold tracking-[3px] uppercase text-foreground/50 whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 border-t border-dashed border-foreground/[0.12]" />
    </div>
  );
}
