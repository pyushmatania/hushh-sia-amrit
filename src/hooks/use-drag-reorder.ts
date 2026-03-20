import { useState, useCallback, useEffect, useRef } from "react";

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

  // Use refs to avoid stale closures in drag event handlers
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
  const detachPointerListenersRef = useRef<(() => void) | null>(null);

  const clearDragState = useCallback(() => {
    dragIdRef.current = null;
    dragCatRef.current = null;
    pointerIdRef.current = null;
    setDragId(null);
    setDragOverId(null);
  }, []);

  const getDropTargetFromPoint = useCallback((x: number, y: number) => {
    if (typeof document === "undefined") return null;

    const element = document.elementFromPoint(x, y) as HTMLElement | null;
    const target = element?.closest<HTMLElement>("[data-reorder-id]");
    const targetId = target?.dataset.reorderId;

    if (!targetId) return null;

    return {
      id: targetId,
      category: target.dataset.reorderCategory ?? "__all__",
    };
  }, []);

  const executeDrop = useCallback((targetId: string, targetCat: string, sourceIdOverride?: string) => {
    const currentDragId = sourceIdOverride ?? dragIdRef.current;
    if (!currentDragId || currentDragId === targetId) {
      clearDragState();
      return;
    }

    const gc = getCategoryRef.current;
    if (gc && targetCat !== dragCatRef.current) {
      clearDragState();
      return;
    }

    const currentItems = itemsRef.current;
    const gid = getIdRef.current;

    const relevantItems = gc
      ? currentItems.filter(i => gc(i) === targetCat)
      : currentItems;

    const ids = relevantItems.map(gid);
    const fromIdx = ids.indexOf(currentDragId);
    const toIdx = ids.indexOf(targetId);

    if (fromIdx === -1 || toIdx === -1) {
      clearDragState();
      return;
    }

    const reordered = [...ids];
    [reordered[fromIdx], reordered[toIdx]] = [reordered[toIdx], reordered[fromIdx]];

    const updates = reordered.map((id, idx) => ({ id, sort_order: idx }));

    clearDragState();

    onReorderRef.current(updates);
  }, [clearDragState]);

  const getDragHandleProps = useCallback((item: T) => {
    const id = getIdRef.current(item);
    const cat = getCategoryRef.current?.(item) ?? "__all__";
    const a11yLabel = getA11yLabelRef.current?.(item) ?? "Drag to reorder";

    const attachPointerListeners = () => {
      if (detachPointerListenersRef.current) return;

      const onPointerMove = (event: PointerEvent) => {
        if (pointerIdRef.current !== event.pointerId) return;
        const target = getDropTargetFromPoint(event.clientX, event.clientY);
        setDragOverId(target?.id ?? null);
      };

      const finishPointerDrag = (event: PointerEvent) => {
        if (pointerIdRef.current !== event.pointerId) return;

        const target = getDropTargetFromPoint(event.clientX, event.clientY);

        if (target) {
          executeDrop(target.id, target.category);
        } else {
          clearDragState();
        }

        detachPointerListenersRef.current?.();
        detachPointerListenersRef.current = null;
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", finishPointerDrag);
      window.addEventListener("pointercancel", finishPointerDrag);

      detachPointerListenersRef.current = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", finishPointerDrag);
        window.removeEventListener("pointercancel", finishPointerDrag);
      };
    };

    return {
      draggable: true,
      role: "button" as const,
      tabIndex: 0,
      "aria-label": a11yLabel,
      "aria-roledescription": "Drag handle",
      onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        dragIdRef.current = id;
        dragCatRef.current = cat;
        setDragId(id);
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

        e.preventDefault();
        e.stopPropagation();

        const gc = getCategoryRef.current;
        const currentItems = itemsRef.current;
        const gid = getIdRef.current;

        const relevantItems = gc
          ? currentItems.filter(i => gc(i) === cat)
          : currentItems;

        const ids = relevantItems.map(gid);
        const fromIdx = ids.indexOf(id);
        const toIdx = e.key === "ArrowUp" ? fromIdx - 1 : fromIdx + 1;

        if (fromIdx === -1 || toIdx < 0 || toIdx >= ids.length) return;

        const targetId = ids[toIdx];
        dragIdRef.current = id;
        dragCatRef.current = cat;
        setDragId(id);
        setDragOverId(targetId);
        executeDrop(targetId, cat, id);
      },
      onPointerDown: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse") return;

        e.preventDefault();
        e.stopPropagation();

        dragIdRef.current = id;
        dragCatRef.current = cat;
        pointerIdRef.current = e.pointerId;
        setDragId(id);
        setDragOverId(id);

        attachPointerListeners();
      },
    };
  }, [clearDragState, executeDrop, getDropTargetFromPoint]);

  const getDropTargetProps = useCallback((item: T) => {
    const id = getIdRef.current(item);
    const cat = getCategoryRef.current?.(item) ?? "__all__";
    return {
      "data-reorder-id": id,
      "data-reorder-category": cat,
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverId(id);
      },
      onDragLeave: () => {
        setDragOverId(prev => prev === id ? null : prev);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        executeDrop(id, cat);
      },
    };
  }, [executeDrop]);

  const handleDragEnd = useCallback(() => {
    detachPointerListenersRef.current?.();
    detachPointerListenersRef.current = null;
    clearDragState();
  }, [clearDragState]);

  useEffect(() => {
    return () => {
      detachPointerListenersRef.current?.();
      detachPointerListenersRef.current = null;
    };
  }, []);

  const isDragging = (item: T) => getIdRef.current(item) === dragId;
  const isDragOver = (item: T) => {
    const id = getIdRef.current(item);
    return id === dragOverId && id !== dragId;
  };

  return {
    dragId,
    getDragHandleProps,
    getDropTargetProps,
    handleDragEnd,
    isDragging,
    isDragOver,
  };
}