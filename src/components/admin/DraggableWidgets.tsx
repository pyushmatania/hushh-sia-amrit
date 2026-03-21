import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Lock, Unlock, RotateCcw, Sparkles } from "lucide-react";

const STORAGE_KEY = "hushh-dashboard-widget-order";

interface WidgetConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  render: () => React.ReactNode;
}

function loadOrder(defaultIds: string[]): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultIds;
    const parsed = JSON.parse(saved) as string[];
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

  // Pointer-based drag state
  const pointerIdRef = useRef<number | null>(null);
  const startYRef = useRef(0);
  const dragThreshold = 8;
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRectsRef = useRef<DOMRect[]>([]);

  const captureRects = useCallback(() => {
    if (!containerRef.current) return;
    const children = containerRef.current.querySelectorAll("[data-widget-idx]");
    widgetRectsRef.current = Array.from(children).map(el => el.getBoundingClientRect());
  }, []);

  const findOverIdx = useCallback((clientY: number) => {
    const rects = widgetRectsRef.current;
    for (let i = 0; i < rects.length; i++) {
      const mid = rects[i].top + rects[i].height / 2;
      if (clientY < mid) return i;
    }
    return rects.length - 1;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, idx: number) => {
    if (!editMode || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    pointerIdRef.current = e.pointerId;
    startYRef.current = e.clientY;
    isDraggingRef.current = false;
    setDragIdx(idx);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    captureRects();
  }, [editMode, captureRects]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId || dragIdx === null) return;
    if (!isDraggingRef.current && Math.abs(e.clientY - startYRef.current) > dragThreshold) {
      isDraggingRef.current = true;
    }
    if (isDraggingRef.current) {
      const newOver = findOverIdx(e.clientY);
      setOverIdx(newOver);
      // Auto-scroll
      if (e.clientY < 80) window.scrollBy({ top: -12 });
      else if (window.innerHeight - e.clientY < 80) window.scrollBy({ top: 12 });
    }
  }, [dragIdx, findOverIdx]);

  const handlePointerUp = useCallback(() => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx && isDraggingRef.current) {
      setOrder(prev => {
        const next = [...prev];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(overIdx, 0, moved);
        saveOrder(next);
        return next;
      });
    }
    pointerIdRef.current = null;
    isDraggingRef.current = false;
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx, overIdx]);

  const resetOrder = useCallback(() => {
    setOrder(defaultIds);
    saveOrder(defaultIds);
  }, [defaultIds]);

  return {
    orderedWidgets, editMode, setEditMode, dragIdx, overIdx,
    handlePointerDown, handlePointerMove, handlePointerUp,
    resetOrder, containerRef,
  };
}

interface DraggableWidgetWrapperProps {
  widget: WidgetConfig;
  index: number;
  editMode: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onPointerDown: (e: React.PointerEvent, idx: number) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}

export function DraggableWidgetWrapper({
  widget, index, editMode, isDragging, isDragOver,
  onPointerDown, onPointerMove, onPointerUp,
}: DraggableWidgetWrapperProps) {
  return (
    <motion.div
      data-widget-idx={index}
      layout={editMode}
      transition={{ type: "spring", damping: 28, stiffness: 350 }}
      className={`relative group/widget rounded-2xl transition-all duration-300 ${
        editMode ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "opacity-40 scale-[0.97] z-50" : ""} ${
        isDragOver && !isDragging
          ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background rounded-2xl scale-[0.99]"
          : ""
      }`}
    >
      {/* Drag handle — only in edit mode */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute -left-1 top-3 z-30 touch-none"
            onPointerDown={(e) => onPointerDown(e, index)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <div className="w-7 h-12 rounded-xl bg-gradient-to-b from-primary/15 to-primary/5 border border-primary/20 flex flex-col items-center justify-center gap-0.5 backdrop-blur-md shadow-lg shadow-primary/5 hover:from-primary/25 hover:to-primary/10 transition-all duration-200">
              <GripVertical size={14} className="text-primary/60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating label badge */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-2.5 left-10 z-30 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/20 backdrop-blur-md shadow-sm flex items-center gap-1"
          >
            <Sparkles size={9} />
            {widget.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle edit mode border glow */}
      {editMode && !isDragging && (
        <div className="absolute inset-0 rounded-2xl border border-dashed border-primary/15 pointer-events-none" />
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
      <AnimatePresence>
        {editMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-xl bg-secondary/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
          >
            <RotateCcw size={10} />
            Reset
          </motion.button>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.03 }}
        onClick={onToggle}
        className={`flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-2 rounded-xl border backdrop-blur-sm transition-all duration-300 shadow-sm ${
          editMode
            ? "bg-gradient-to-r from-primary/15 to-primary/5 border-primary/30 text-primary shadow-primary/10"
            : "bg-secondary/80 border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
        }`}
      >
        {editMode ? <Unlock size={13} /> : <Lock size={13} />}
        {editMode ? "Done" : "Customize"}
      </motion.button>
    </div>
  );
}

export type { WidgetConfig };
