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
  const dragCatRef = useRef<string | null>(null);

  const getDragHandleProps = useCallback((item: T) => {
    const id = getId(item);
    const cat = getCategory?.(item) ?? "__all__";
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = "move";
        // Set drag data so the browser shows a drag ghost
        e.dataTransfer.setData("text/plain", id);
        setDragId(id);
        dragCatRef.current = cat;
      },
    };
  }, [getId, getCategory]);

  const getDropTargetProps = useCallback((item: T) => {
    const id = getId(item);
    const cat = getCategory?.(item) ?? "__all__";
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (id !== dragOverId) setDragOverId(id);
      },
      onDragLeave: () => {
        setDragOverId(prev => prev === id ? null : prev);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        handleDrop(id, cat);
      },
    };
  }, [getId, getCategory, dragOverId]);

  const handleDrop = useCallback(async (targetId: string, targetCat: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    // Only allow reorder within same category
    if (getCategory && targetCat !== dragCatRef.current) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const relevantItems = getCategory
      ? items.filter(i => (getCategory(i)) === targetCat)
      : items;

    const ids = relevantItems.map(getId);
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(targetId);

    if (fromIdx === -1 || toIdx === -1) {
      setDragId(null);
      setDragOverId(null);
      return;
    }

    const reordered = [...ids];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const updates = reordered.map((id, idx) => ({ id, sort_order: idx }));

    setDragId(null);
    setDragOverId(null);

    await onReorder(updates);
  }, [dragId, items, getId, getCategory, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);

  const isDragging = (item: T) => getId(item) === dragId;
  const isDragOver = (item: T) => getId(item) === dragOverId && getId(item) !== dragId;

  return {
    dragId,
    getDragHandleProps,
    getDropTargetProps,
    handleDragEnd,
    isDragging,
    isDragOver,
  };
}
