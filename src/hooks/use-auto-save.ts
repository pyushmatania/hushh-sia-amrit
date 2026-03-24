import { useRef, useEffect, useState, useCallback } from "react";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T | null;
  onSave: (data: T) => Promise<boolean>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({ data, onSave, debounceMs = 1500, enabled = true }: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const dataRef = useRef<T | null>(data);

  dataRef.current = data;

  const save = useCallback(async () => {
    if (!dataRef.current || !enabled) return;
    const serialized = JSON.stringify(dataRef.current);
    if (serialized === lastSavedRef.current) return;

    setStatus("saving");
    try {
      const ok = await onSave(dataRef.current);
      if (ok) {
        lastSavedRef.current = serialized;
        setStatus("saved");
        setTimeout(() => setStatus(s => s === "saved" ? "idle" : s), 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [onSave, enabled]);

  useEffect(() => {
    if (!data || !enabled) return;
    const serialized = JSON.stringify(data);
    if (serialized === lastSavedRef.current) return;

    setStatus("idle");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, debounceMs);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, debounceMs, save, enabled]);

  // Initialize lastSavedRef on first mount so we don't trigger save on open
  const initRef = useRef(false);
  useEffect(() => {
    if (data && !initRef.current) {
      lastSavedRef.current = JSON.stringify(data);
      initRef.current = true;
    }
  }, [data]);

  // Reset when data becomes null (editor closed)
  useEffect(() => {
    if (!data) {
      initRef.current = false;
      lastSavedRef.current = "";
      setStatus("idle");
    }
  }, [data]);

  return { status, saveNow: save };
}
