import { FileText, Loader2, CheckCircle2, AlertCircle, Trash2, Pencil, Calendar as CalendarIcon, Sparkles, RefreshCw, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface DocumentData {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  section: string;
  ai_extracted_data: any;
  ai_summary: string | null;
  ai_status: string | null;
  created_at: string;
}

interface DocumentCardGridProps {
  documents: DocumentData[];
  onDelete: (id: string, filePath: string) => void;
  onSelect?: (doc: DocumentData | null) => void;
  onUpdate?: (id: string, updatedAiData: any, newFileName?: string) => void;
  onReanalyze?: (doc: DocumentData) => void;
  reanalyzingIds?: Set<string>;
  selectedId?: string | null;
  searchQuery?: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  completed: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Analizzato", color: "text-success bg-success/10" },
  processing: { icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, label: "In analisi", color: "text-accent bg-accent/10" },
  error: { icon: <AlertCircle className="w-3.5 h-3.5" />, label: "Errore", color: "text-destructive bg-destructive/10" },
  pending: { icon: <Loader2 className="w-3.5 h-3.5" />, label: "In attesa", color: "text-muted-foreground bg-muted" },
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (parts) return `${parts[1].padStart(2, '0')}.${parts[2].padStart(2, '0')}.${parts[3]}`;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    return dateStr;
  } catch { return dateStr; }
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getElaboratoDa(ai: any): string {
  if (!ai) return "";
  if (ai.elaborato_da) return String(ai.elaborato_da);
  if (ai.parti_coinvolte && Array.isArray(ai.parti_coinvolte) && ai.parti_coinvolte.length > 0) {
    return ai.parti_coinvolte.map((p: any) => (typeof p === "object" ? p.nome || p.name || "" : p)).join(", ");
  }
  return "";
}

function isImageFile(fileType: string | null, fileName: string): boolean {
  if (fileType?.startsWith("image/")) return true;
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
}

function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
  return data.publicUrl;
}

export function DocumentCardGrid({ documents, onDelete, onSelect, onReanalyze, reanalyzingIds, selectedId, searchQuery = "" }: DocumentCardGridProps) {
  const filtered = searchQuery.trim()
    ? documents.filter((doc) => {
        const q = searchQuery.toLowerCase();
        const ai = doc.ai_extracted_data;
        return (
          doc.file_name.toLowerCase().includes(q) ||
          (ai?.titolo || "").toLowerCase().includes(q) ||
          getElaboratoDa(ai).toLowerCase().includes(q) ||
          (doc.ai_summary || "").toLowerCase().includes(q)
        );
      })
    : documents;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Nessun risultato trovato
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {filtered.map((doc) => {
        const ai = doc.ai_extracted_data;
        const status = statusConfig[doc.ai_status || "pending"];
        const titolo = ai?.titolo;
        const elaboratoDa = getElaboratoDa(ai);
        const dataDoc = ai?.data;

        return (
          <div
            key={doc.id}
            className={cn(
              "bg-card rounded-lg border border-border p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary/30 flex flex-col gap-3 animate-fade-in",
              selectedId === doc.id && "ring-2 ring-primary border-primary"
            )}
            onClick={() => onSelect?.(selectedId === doc.id ? null : doc)}
          >
            {/* Thumbnail or icon */}
            {isImageFile(doc.file_type, doc.file_name) ? (
              <div className="relative w-full aspect-[4/3] -mx-4 -mt-4 mb-1 overflow-hidden rounded-t-lg bg-muted">
                <img
                  src={getPublicUrl(doc.file_path)}
                  alt={doc.file_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className={cn("absolute top-2 right-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm", status.color)}>
                  {status.icon}
                  {status.label}
                </span>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", status.color)}>
                  {status.icon}
                  {status.label}
                </span>
              </div>
            )}

            {/* File name */}
            <p className="text-sm font-semibold text-card-foreground line-clamp-2 leading-tight">{doc.file_name}</p>

            {/* Titolo / Oggetto */}
            {titolo && (
              <p className="text-xs text-muted-foreground line-clamp-2">{titolo}</p>
            )}

            {/* Meta info */}
            <div className="mt-auto space-y-1.5">
              {elaboratoDa && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">Da:</span>
                  <span className="truncate">{elaboratoDa}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {dataDoc && dataDoc !== "—" && (
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {formatDate(dataDoc)}
                  </span>
                )}
                {doc.file_size && (
                  <span>{formatFileSize(doc.file_size)}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center border-t border-border pt-2 -mb-1">
              <div className="flex items-center gap-1">
                {doc.ai_status === "completed" && ai ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-success hover:text-success"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 max-h-96 overflow-auto" align="start" onClick={(e) => e.stopPropagation()}>
                      <h4 className="text-sm font-semibold mb-2">Sintesi AI</h4>
                      {doc.ai_summary ? (
                        <p className="text-sm text-muted-foreground">{doc.ai_summary}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nessuna sintesi disponibile.</p>
                      )}
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className={cn("inline-flex items-center gap-1 text-xs", statusConfig[doc.ai_status || "pending"]?.color)}>
                    {statusConfig[doc.ai_status || "pending"]?.icon}
                  </span>
                )}
                {onReanalyze && (doc.ai_status === "completed" || doc.ai_status === "error") && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    disabled={reanalyzingIds?.has(doc.id)}
                    onClick={(e) => { e.stopPropagation(); onReanalyze(doc); }}
                    title="Rianalizza"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", reanalyzingIds?.has(doc.id) && "animate-spin")} />
                  </Button>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id, doc.file_path);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
