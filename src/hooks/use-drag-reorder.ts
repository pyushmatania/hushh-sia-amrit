import { useState, useCallback, useEffect, useRef } from "react";

interface UseDragReorderOptions<T> {
  items: T[];
  getId: (item: T) => string;
  getCategory?: (item: T) => string;
  onReorder: (reorderedItems: { id: string; sort_order: number }[]) => Promise<void>;
}

export function useDragReorder<T>({ items, getId, getCategory, onReorder }: UseDragReorderOptions<T>) {
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

  const getDragHandleProps = useCallback((item: T) => {
    const id = getIdRef.current(item);
    const cat = getCategoryRef.current?.(item) ?? "__all__";

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
      onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        dragIdRef.current = id;
        dragCatRef.current = cat;
        setDragId(id);
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

  const executeDrop = useCallback((targetId: string, targetCat: string) => {
    const currentDragId = dragIdRef.current;
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
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const updates = reordered.map((id, idx) => ({ id, sort_order: idx }));

    clearDragState();

    onReorderRef.current(updates);
  }, [clearDragState]);

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
