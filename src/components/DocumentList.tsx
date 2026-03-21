import { FileText, Loader2, CheckCircle2, AlertCircle, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

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

interface DocumentListProps {
  documents: DocumentData[];
  onDelete: (id: string, filePath: string) => void;
}

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="w-4 h-4 text-success" />,
  processing: <Loader2 className="w-4 h-4 text-accent animate-spin" />,
  error: <AlertCircle className="w-4 h-4 text-destructive" />,
  pending: <Loader2 className="w-4 h-4 text-muted-foreground" />,
};

const statusLabels: Record<string, string> = {
  completed: "Analizzato",
  processing: "In analisi...",
  error: "Errore",
  pending: "In attesa",
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (documents.length === 0) return null;

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-card rounded-lg border border-border overflow-hidden animate-fade-in"
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
          >
            <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">{doc.file_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {statusIcons[doc.ai_status || 'pending']}
                <span className="text-xs text-muted-foreground">
                  {statusLabels[doc.ai_status || 'pending']}
                </span>
                {doc.file_size && (
                  <span className="text-xs text-muted-foreground">• {formatFileSize(doc.file_size)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedId(expandedId === doc.id ? null : doc.id);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id, doc.file_path);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Expanded AI data */}
          {expandedId === doc.id && doc.ai_status === 'completed' && doc.ai_extracted_data && (
            <div className="border-t border-border p-4 bg-muted/30">
              {doc.ai_summary && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Riepilogo AI</p>
                  <p className="text-sm text-card-foreground">{doc.ai_summary}</p>
                </div>
              )}
              <ExtractedDataView data={doc.ai_extracted_data} />
            </div>
          )}

          {expandedId === doc.id && doc.ai_status === 'error' && (
            <div className="border-t border-border p-4 bg-destructive/5">
              <p className="text-sm text-destructive">L'analisi AI ha riscontrato un errore. Riprova il caricamento.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExtractedDataView({ data }: { data: any }) {
  const fields = [
    { key: 'tipo_documento', label: 'Tipo Documento' },
    { key: 'titolo', label: 'Titolo' },
    { key: 'data', label: 'Data' },
    { key: 'parti_coinvolte', label: 'Parti Coinvolte' },
    { key: 'importi', label: 'Importi' },
    { key: 'scadenze', label: 'Scadenze' },
    { key: 'riferimenti_normativi', label: 'Riferimenti Normativi' },
    { key: 'materiali', label: 'Materiali' },
    { key: 'lavorazioni', label: 'Lavorazioni' },
    { key: 'note_sicurezza', label: 'Note Sicurezza' },
    { key: 'note_ambientali', label: 'Note Ambientali' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {fields.map(({ key, label }) => {
        const value = data[key];
        if (!value || (Array.isArray(value) && value.length === 0)) return null;

        return (
          <div key={key}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm text-card-foreground">
              {Array.isArray(value)
                ? value.map((v: any) => (typeof v === 'object' ? JSON.stringify(v) : v)).join(', ')
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
