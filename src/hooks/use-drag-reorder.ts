import { useState, useCallback, useRef } from "react";

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

  const getDragHandleProps = useCallback((item: T) => {
    const id = getIdRef.current(item);
    const cat = getCategoryRef.current?.(item) ?? "__all__";
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
        dragIdRef.current = id;
        dragCatRef.current = cat;
        setDragId(id);
      },
    };
  }, []);

  const executeDrop = useCallback((targetId: string, targetCat: string) => {
    const currentDragId = dragIdRef.current;
    if (!currentDragId || currentDragId === targetId) {
      dragIdRef.current = null;
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const gc = getCategoryRef.current;
    if (gc && targetCat !== dragCatRef.current) {
      dragIdRef.current = null;
      setDragId(null);
      setDragOverId(null);
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
      dragIdRef.current = null;
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...ids];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const updates = reordered.map((id, idx) => ({ id, sort_order: idx }));

    dragIdRef.current = null;
    setDragId(null);
    setDragOverId(null);

    onReorderRef.current(updates);
  }, []);

  const getDropTargetProps = useCallback((item: T) => {
    const id = getIdRef.current(item);
    const cat = getCategoryRef.current?.(item) ?? "__all__";
    return {
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
    dragIdRef.current = null;
    setDragId(null);
    setDragOverId(null);
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
