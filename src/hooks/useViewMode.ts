import { useState, useCallback } from "react";
import type { ViewMode } from "@/components/DocumentToolbar";

export function useViewMode(section: string, defaultMode: ViewMode = "table") {
  const storageKey = `view-mode-${section}`;

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "table" || saved === "grid") return saved;
    } catch {}
    return defaultMode;
  });

  const updateViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem(storageKey, mode); } catch {}
  }, [storageKey]);

  return { viewMode, updateViewMode };
}
