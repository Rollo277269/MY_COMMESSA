import { useState, useRef, useCallback } from "react";

export function useDocumentFilters() {
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const clearFiltersRef = useRef<(() => void) | null>(null);

  const clearAllFilters = useCallback(() => {
    clearFiltersRef.current?.();
  }, []);

  return { activeFilterCount, setActiveFilterCount, clearFiltersRef, clearAllFilters };
}
