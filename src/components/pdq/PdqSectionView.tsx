import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Pencil, Check, X } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { PdqSection } from "@/lib/generatePdqPdf";

interface Props {
  section: PdqSection;
  editable?: boolean;
  onSectionChange?: (updated: PdqSection) => void;
}

export function PdqSectionView({ section, editable = false, onSectionChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [editingCell, setEditingCell] = useState<{ ti: number; ri: number; ci: number } | null>(null);
  const [draftContent, setDraftContent] = useState(section.content);
  const [draftCell, setDraftCell] = useState("");
  const cellInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraftContent(section.content);
  }, [section.content]);

  useEffect(() => {
    if (editingCell && cellInputRef.current) cellInputRef.current.focus();
  }, [editingCell]);

  useEffect(() => {
    if (editingContent && textareaRef.current) textareaRef.current.focus();
  }, [editingContent]);

  const saveContent = useCallback(() => {
    if (onSectionChange && draftContent !== section.content) {
      onSectionChange({ ...section, content: draftContent });
    }
    setEditingContent(false);
  }, [draftContent, section, onSectionChange]);

  const saveCell = useCallback(() => {
    if (!editingCell || !onSectionChange) return;
    const { ti, ri, ci } = editingCell;
    const newTables = [...(section.tables || [])];
    const newRows = [...newTables[ti].rows];
    const newRow = [...newRows[ri]];
    newRow[ci] = draftCell;
    newRows[ri] = newRow;
    newTables[ti] = { ...newTables[ti], rows: newRows };
    onSectionChange({ ...section, tables: newTables });
    setEditingCell(null);
  }, [editingCell, draftCell, section, onSectionChange]);

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-5 py-3 border-b border-border hover:bg-muted/30 transition-colors text-left"
      >
        {collapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        <span className="font-display font-semibold text-foreground text-sm">
          {section.number}. {section.title}
        </span>
      </button>
      {!collapsed && (
        <div className="p-5 space-y-4">
          {/* Content area */}
          {section.content && !editingContent && (
            <div className="group relative">
              <p className="text-sm text-card-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
              {editable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={() => { setDraftContent(section.content); setEditingContent(true); }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
          {editingContent && (
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                className="min-h-[120px] text-sm"
              />
              <div className="flex gap-1.5 justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingContent(false)}>
                  <X className="w-3 h-3 mr-1" /> Annulla
                </Button>
                <Button size="sm" className="h-7 text-xs" onClick={saveContent}>
                  <Check className="w-3 h-3 mr-1" /> Salva
                </Button>
              </div>
            </div>
          )}

          {/* Tables */}
          {section.tables?.map((table, ti) => (
            <div key={ti} className="space-y-2">
              {table.title && (
                <h4 className="text-sm font-semibold text-foreground">{table.title}</h4>
              )}
              {table.headers?.length > 0 && table.rows?.length > 0 && (
                <div className="overflow-x-auto border border-border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {table.headers.map((h, hi) => (
                          <TableHead key={hi} className="text-xs">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.rows.map((row, ri) => (
                        <TableRow key={ri}>
                          {row.map((cell, ci) => (
                            <TableCell
                              key={ci}
                              className={`text-xs ${editable ? "cursor-pointer hover:bg-muted/50" : ""}`}
                              onDoubleClick={() => {
                                if (!editable) return;
                                setEditingCell({ ti, ri, ci });
                                setDraftCell(cell);
                              }}
                            >
                              {editingCell?.ti === ti && editingCell?.ri === ri && editingCell?.ci === ci ? (
                                <input
                                  ref={cellInputRef}
                                  value={draftCell}
                                  onChange={(e) => setDraftCell(e.target.value)}
                                  onBlur={saveCell}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveCell();
                                    if (e.key === "Escape") setEditingCell(null);
                                  }}
                                  className="w-full bg-background border border-primary rounded px-1 py-0.5 text-xs outline-none"
                                />
                              ) : (
                                cell
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
