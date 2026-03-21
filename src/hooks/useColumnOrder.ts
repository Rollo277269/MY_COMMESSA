import { useState, useCallback } from "react";
import type { ColumnKey } from "@/components/DocumentTable";

export function useColumnOrder(section: string, defaultColumns: ColumnKey[]) {
  const orderKey = `col-order-${section}`;
  const widthsKey = `col-widths-${section}`;

  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(() => {
    try {
      const saved = localStorage.getItem(orderKey);
      if (saved) return JSON.parse(saved) as ColumnKey[];
    } catch {}
    return defaultColumns;
  });

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(widthsKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const updateColumnOrder = useCallback((newOrder: ColumnKey[]) => {
    setColumnOrder(newOrder);
    try { localStorage.setItem(orderKey, JSON.stringify(newOrder)); } catch {}
  }, [orderKey]);

  const updateColumnWidths = useCallback((newWidths: Record<string, number>) => {
    setColumnWidths(newWidths);
    try { localStorage.setItem(widthsKey, JSON.stringify(newWidths)); } catch {}
  }, [widthsKey]);

  const resetColumns = useCallback(() => {
    setColumnOrder(defaultColumns);
    setColumnWidths({});
    try {
      localStorage.removeItem(orderKey);
      localStorage.removeItem(widthsKey);
    } catch {}
  }, [defaultColumns, orderKey, widthsKey]);

  return { columnOrder, updateColumnOrder, columnWidths, updateColumnWidths, resetColumns };
}
