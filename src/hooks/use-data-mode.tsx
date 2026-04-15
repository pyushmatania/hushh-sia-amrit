import { useAppConfig } from "./use-app-config";

/**
 * Returns whether the app should show demo data.
 * When data_mode is "real", demo data is suppressed — empty states are shown instead.
 * When data_mode is "demo" (default), fallback demo data is displayed when DB is empty.
 */
export function useDataMode() {
  const config = useAppConfig();
  const isRealMode = config.data_mode === "real";
  const isDemoMode = config.data_mode !== "real";

  return {
    /** true when admin has set data_mode to "real" */
    isRealMode,
    /** true when demo/sample data should be shown as fallback (default) */
    isDemoMode,
    /** Helper: returns demo data only if in demo mode, otherwise empty array */
    getDemoFallback: <T,>(demoData: T[]): T[] => isDemoMode ? demoData : [],
  };
}
