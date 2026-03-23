import { X, FileText, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface DocumentPreviewProps {
  document: {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string | null;
  };
  onClose: () => void;
}

export function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSignedUrl(null);

    supabase.storage
      .from("cm_documents")
      .createSignedUrl(document.file_path, 3600) // 1 hour
      .then(({ data, error }) => {
        if (!cancelled) {
          setSignedUrl(error ? null : data?.signedUrl ?? null);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [document.file_path]);

  const isImage = document.file_type?.startsWith("image/");
  const isPdf = document.file_type === "application/pdf" || document.file_name.toLowerCase().endsWith(".pdf");
  const isOfficeOrOther = !isImage && !isPdf;

  const googleViewerUrl = isOfficeOrOther && signedUrl
    ? `https://docs.google.com/gview?url=${encodeURIComponent(signedUrl)}&embedded=true`
    : "";

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-card border-l border-border items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{document.file_name}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {signedUrl && (
            <Button size="icon" variant="ghost" className="h-7 w-7" asChild>
              <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!signedUrl ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <FileText className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Impossibile caricare l'anteprima.</p>
          </div>
        ) : isPdf ? (
          <iframe
            src={`${signedUrl}#toolbar=1`}
            className="w-full h-full border-0"
            title={document.file_name}
          />
        ) : isImage ? (
          <div className="flex items-center justify-center p-4 h-full">
            <img
              src={signedUrl}
              alt={document.file_name}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
        ) : (
          <iframe
            src={googleViewerUrl}
            className="w-full h-full border-0"
            title={document.file_name}
          />
        )}
      </div>
    </div>
  );
}
