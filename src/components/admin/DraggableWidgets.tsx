import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { GripVertical, Lock, Unlock } from "lucide-react";

const STORAGE_KEY = "hushh-dashboard-widget-order";

interface WidgetConfig {
  id: string;
  label: string;
  render: () => React.ReactNode;
}

function loadOrder(defaultIds: string[]): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultIds;
    const parsed = JSON.parse(saved) as string[];
    // Ensure all widgets are present (handle new widgets added after save)
    const merged = [...parsed.filter(id => defaultIds.includes(id))];
    defaultIds.forEach(id => { if (!merged.includes(id)) merged.push(id); });
    return merged;
  } catch { return defaultIds; }
}

function saveOrder(ids: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch {}
}

export function useDraggableWidgets(widgets: WidgetConfig[]) {
  const defaultIds = widgets.map(w => w.id);
  const [order, setOrder] = useState(() => loadOrder(defaultIds));
  const [editMode, setEditMode] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const orderedWidgets = order
    .map(id => widgets.find(w => w.id === id))
    .filter(Boolean) as WidgetConfig[];

  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((idx: number) => {
    setOverIdx(idx);
  }, []);

  const handleDrop = useCallback(() => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      setOrder(prev => {
        const next = [...prev];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(overIdx, 0, moved);
        saveOrder(next);
        return next;
      });
    }
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx, overIdx]);

  const resetOrder = useCallback(() => {
    setOrder(defaultIds);
    saveOrder(defaultIds);
  }, [defaultIds]);

  return { orderedWidgets, editMode, setEditMode, dragIdx, overIdx, handleDragStart, handleDragOver, handleDrop, resetOrder, setDragIdx };
}

interface DraggableWidgetWrapperProps {
  widget: WidgetConfig;
  index: number;
  editMode: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (idx: number) => void;
  onDragOver: (idx: number) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

export function DraggableWidgetWrapper({
  widget, index, editMode, isDragging, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: DraggableWidgetWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      layout={editMode}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      draggable={editMode}
      onDragStart={(e) => {
        if (!editMode) return;
        onDragStart(index);
      }}
      onDragOver={(e) => {
        if (!editMode) return;
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={(e) => {
        if (!editMode) return;
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={() => {
        if (!editMode) return;
        onDragEnd();
      }}
      className={`relative transition-all duration-200 ${
        editMode ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "opacity-30 scale-[0.97]" : ""} ${
        isDragOver ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background rounded-2xl" : ""
      }`}
    >
      {/* Drag handle overlay */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute -left-1 top-1/2 -translate-y-1/2 z-20 flex items-center"
        >
          <div className="w-6 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm shadow-sm">
            <GripVertical size={14} className="text-primary/60" />
          </div>
        </motion.div>
      )}

      {/* Widget label badge in edit mode */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-2 left-8 z-20 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm"
        >
          {widget.label}
        </motion.div>
      )}

      <div className={editMode ? "pointer-events-none select-none" : ""}>
        {widget.render()}
      </div>
    </motion.div>
  );
}

export function DashboardEditToggle({ editMode, onToggle, onReset }: { editMode: boolean; onToggle: () => void; onReset: () => void }) {
  return (
    <div className="flex items-center gap-2">
      {editMode && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onReset}
          className="text-[10px] px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground transition"
        >
          Reset Layout
        </motion.button>
      )}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition ${
          editMode
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
        }`}
      >
        {editMode ? <Unlock size={12} /> : <Lock size={12} />}
        {editMode ? "Done" : "Customize"}
      </motion.button>
    </div>
  );
}
