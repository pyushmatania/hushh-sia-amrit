import { useState, useCallback, useEffect, useRef } from "react";
import { playDragStartSound, playDropSound } from "@/lib/drag-sounds";

interface UseDragReorderOptions<T> {
  items: T[];
  getId: (item: T) => string;
  getCategory?: (item: T) => string;
  getA11yLabel?: (item: T) => string;
  onReorder: (reorderedItems: { id: string; sort_order: number }[]) => Promise<void>;
}

export function useDragReorder<T>({ items, getId, getCategory, getA11yLabel, onReorder }: UseDragReorderOptions<T>) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [justDroppedId, setJustDroppedId] = useState<string | null>(null);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragIdRef = useRef<string | null>(null);
  const dragCatRef = useRef<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const getIdRef = useRef(getId);
  getIdRef.current = getId;
  const getCategoryRef = useRef(getCategory);
  getCategoryRef.current = getCategory;
  const getA11yLabelRef = useRef(getA11yLabel);
  getA11yLabelRef.current = getA11yLabel;
  const onReorderRef = useRef(onReorder);
  onReorderRef.current = onReorder;

  const pointerIdRef = useRef<number | null>(null);
  const detachRef = useRef<(() => void) | null>(null);
  const activeHandleRef = useRef<HTMLElement | null>(null);
  const originalBodyUserSelectRef = useRef<string | null>(null);
  const originalBodyCursorRef = useRef<string | null>(null);
  const ghostRef = useRef<HTMLElement | null>(null);
  const sourceRowRef = useRef<HTMLElement | null>(null);
  const pointerOffsetRef = useRef({ x: 0, y: 0 });

  const lockSelectionWhileDragging = useCallback(() => {
    if (typeof document === "undefined") return;
    const { body } = document;
    if (originalBodyUserSelectRef.current === null) {
      originalBodyUserSelectRef.current = body.style.userSelect;
    }
    if (originalBodyCursorRef.current === null) {
      originalBodyCursorRef.current = body.style.cursor;
    }
    body.style.userSelect = "none";
    body.style.cursor = "grabbing";
  }, []);

  const unlockSelectionAfterDrag = useCallback(() => {
    if (typeof document === "undefined") return;
    const { body } = document;
    body.style.userSelect = originalBodyUserSelectRef.current ?? "";
    body.style.cursor = originalBodyCursorRef.current ?? "";
    originalBodyUserSelectRef.current = null;
    originalBodyCursorRef.current = null;
  }, []);

  const removeGhost = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
    sourceRowRef.current = null;
  }, []);

  const clearDragState = useCallback(() => {
    const pointerId = pointerIdRef.current;
    if (pointerId !== null && activeHandleRef.current?.hasPointerCapture(pointerId)) {
      activeHandleRef.current.releasePointerCapture(pointerId);
    }

    removeGhost();
    activeHandleRef.current = null;
    dragIdRef.current = null;
    dragCatRef.current = null;
    pointerIdRef.current = null;
    unlockSelectionAfterDrag();
    setDragId(null);
    setDragOverId(null);
  }, [unlockSelectionAfterDrag, removeGhost]);

  const getDropTargetFromPoint = useCallback((x: number, y: number) => {
    if (typeof document === "undefined") return null;
    // Temporarily hide ghost so elementFromPoint hits the real DOM
    const ghost = ghostRef.current;
    if (ghost) ghost.style.pointerEvents = "none";
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (ghost) ghost.style.pointerEvents = "";
    const target = el?.closest<HTMLElement>("[data-reorder-id]");
    if (!target?.dataset.reorderId) return null;
    return { id: target.dataset.reorderId, category: target.dataset.reorderCategory ?? "__all__" };
  }, []);

  const executeDrop = useCallback((targetId: string, targetCat: string, sourceIdOverride?: string) => {
    const currentDragId = sourceIdOverride ?? dragIdRef.current;
    if (!currentDragId || currentDragId === targetId) { clearDragState(); return; }

    const gc = getCategoryRef.current;
    if (gc && targetCat !== dragCatRef.current) { clearDragState(); return; }

    const currentItems = itemsRef.current;
    const gid = getIdRef.current;
    const relevantItems = gc ? currentItems.filter(i => gc(i) === targetCat) : currentItems;
    const ids = relevantItems.map(gid);
    const fromIdx = ids.indexOf(currentDragId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) { clearDragState(); return; }

    const reordered = [...ids];
    [reordered[fromIdx], reordered[toIdx]] = [reordered[toIdx], reordered[fromIdx]];
    const updates = reordered.map((id, idx) => ({ id, sort_order: idx }));
    const droppedId = currentDragId;
    clearDragState();

    // Trigger spring settle animation
    setJustDroppedId(droppedId);
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    dropTimerRef.current = setTimeout(() => setJustDroppedId(null), 500);

    onReorderRef.current(updates);
  }, [clearDragState]);

  const createGhost = useCallback((sourceRow: HTMLElement, clientX: number, clientY: number) => {
    const rect = sourceRow.getBoundingClientRect();
    const clone = sourceRow.cloneNode(true) as HTMLElement;

    // Store pointer offset relative to element top-left
    pointerOffsetRef.current = { x: clientX - rect.left, y: clientY - rect.top };

    Object.assign(clone.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      zIndex: "9999",
      pointerEvents: "none",
      transform: "scale(1.04) rotate(1.2deg)",
      boxShadow: "0 20px 50px -8px rgba(0,0,0,0.5), 0 0 0 1px hsl(var(--primary) / 0.3)",
      borderRadius: "12px",
      opacity: "0.95",
      transition: "transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms ease-out",
      willChange: "transform",
    });

    clone.removeAttribute("data-reorder-id");
    document.body.appendChild(clone);
    ghostRef.current = clone;
    sourceRowRef.current = sourceRow;
  }, []);

  const moveGhost = useCallback((clientX: number, clientY: number) => {
    const ghost = ghostRef.current;
    if (!ghost) return;
    const x = clientX - pointerOffsetRef.current.x;
    const y = clientY - pointerOffsetRef.current.y;
    ghost.style.left = `${x}px`;
    ghost.style.top = `${y}px`;
  }, []);

  const getDragHandleProps = useCallback((item: T) => {
    const id = getIdRef.current(item);
    const cat = getCategoryRef.current?.(item) ?? "__all__";
    const a11yLabel = getA11yLabelRef.current?.(item) ?? "Drag to reorder";

    const attachPointerListeners = () => {
      if (detachRef.current) return;
      const onMove = (e: PointerEvent) => {
        if (pointerIdRef.current !== e.pointerId) return;

        moveGhost(e.clientX, e.clientY);

        const edgeThreshold = 88;
        const scrollStep = 16;
        if (e.clientY < edgeThreshold) {
          window.scrollBy({ top: -scrollStep });
        } else if (window.innerHeight - e.clientY < edgeThreshold) {
          window.scrollBy({ top: scrollStep });
        }

        const t = getDropTargetFromPoint(e.clientX, e.clientY);
        setDragOverId(t?.id ?? null);
      };
      const onEnd = (e: PointerEvent) => {
        if (pointerIdRef.current !== e.pointerId) return;
        const t = getDropTargetFromPoint(e.clientX, e.clientY);
        if (t) executeDrop(t.id, t.category);
        else clearDragState();
        detachRef.current?.();
        detachRef.current = null;
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
      detachRef.current = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };
    };

    return {
      draggable: false,
      role: "button" as const,
      tabIndex: 0,
      "aria-label": a11yLabel,
      "aria-roledescription": "Drag handle",
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        e.preventDefault();
        e.stopPropagation();
        const gc = getCategoryRef.current;
        const gid = getIdRef.current;
        const relevantItems = gc ? itemsRef.current.filter(i => gc(i) === cat) : itemsRef.current;
        const ids = relevantItems.map(gid);
        const fromIdx = ids.indexOf(id);
        const toIdx = e.key === "ArrowUp" ? fromIdx - 1 : fromIdx + 1;
        if (fromIdx === -1 || toIdx < 0 || toIdx >= ids.length) return;
        dragIdRef.current = id;
        dragCatRef.current = cat;
        setDragId(id);
        setDragOverId(ids[toIdx]);
        executeDrop(ids[toIdx], cat, id);
      },
      onPointerDown: (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const handleEl = e.currentTarget as HTMLElement;
        activeHandleRef.current = handleEl;
        handleEl.setPointerCapture(e.pointerId);
        lockSelectionWhileDragging();

        // Find the row element (closest [data-reorder-id]) and create ghost
        const rowEl = handleEl.closest<HTMLElement>("[data-reorder-id]");
        if (rowEl) {
          createGhost(rowEl, e.clientX, e.clientY);
        }

        dragIdRef.current = id;
        dragCatRef.current = cat;
        pointerIdRef.current = e.pointerId;
        setDragId(id);
        setDragOverId(id);
        attachPointerListeners();
      },
    };
  }, [clearDragState, executeDrop, getDropTargetFromPoint, lockSelectionWhileDragging, createGhost, moveGhost]);

  const getDropTargetProps = useCallback((item: T) => {
    const id = getIdRef.current(item);
    const cat = getCategoryRef.current?.(item) ?? "__all__";
    return {
      "data-reorder-id": id,
      "data-reorder-category": cat,
      onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverId(id); },
      onDragLeave: () => { setDragOverId(prev => prev === id ? null : prev); },
      onDrop: (e: React.DragEvent) => { e.preventDefault(); executeDrop(id, cat); },
    };
  }, [executeDrop]);

  const handleDragEnd = useCallback(() => {
    detachRef.current?.();
    detachRef.current = null;
    clearDragState();
  }, [clearDragState]);

  useEffect(() => () => { detachRef.current?.(); detachRef.current = null; removeGhost(); }, [removeGhost]);

  const isDragging = (item: T) => getIdRef.current(item) === dragId;
  const isDragOver = (item: T) => { const id = getIdRef.current(item); return id === dragOverId && id !== dragId; };

  /** Style object to apply on the draggable row for a 3D lift effect */
  const getDragItemStyle = useCallback((item: T): React.CSSProperties => {
    const id = getIdRef.current(item);

    // Spring settle animation after drop
    if (id === justDroppedId) {
      return {
        animation: "spring-settle 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        boxShadow: "0 0 0 2px hsl(var(--primary) / 0.25), 0 4px 16px -4px hsl(var(--primary) / 0.15)",
        borderRadius: "12px",
        transition: "box-shadow 400ms ease-out",
      };
    }

    if (id === dragId) {
      return {
        opacity: 0.25,
        transform: "scale(0.96)",
        border: "2px dashed hsl(var(--primary) / 0.4)",
        background: "hsl(var(--primary) / 0.04)",
        transition: "opacity 200ms ease-out, transform 200ms cubic-bezier(0.16,1,0.3,1)",
      };
    }
    if (id === dragOverId && id !== dragId) {
      return {
        transform: "scale(0.97) translateY(-2px)",
        boxShadow: "0 0 0 2px hsl(var(--primary) / 0.4)",
        transition: "transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms ease-out",
      };
    }
    return {
      transform: "scale(1) rotate(0deg)",
      opacity: 1,
      transition: "transform 250ms cubic-bezier(0.16,1,0.3,1), box-shadow 250ms ease-out, opacity 250ms ease-out, border 250ms ease-out",
    };
  }, [dragId, dragOverId, justDroppedId]);

  return {
    dragId,
    getDragHandleProps,
    getDragItemStyle,
    getDropTargetProps,
    handleDragEnd,
    isDragging,
    isDragOver,
  };
}