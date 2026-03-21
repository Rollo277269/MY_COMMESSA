import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PhotoLightboxProps {
  document: {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string | null;
    ai_extracted_data: any;
    created_at: string;
  } | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function PhotoLightbox({ document, onClose, onPrev, onNext, hasPrev, hasNext }: PhotoLightboxProps) {
  const publicUrl = useMemo(() => {
    if (!document) return "";
    const { data } = supabase.storage.from("documents").getPublicUrl(document.file_path);
    return data.publicUrl;
  }, [document?.file_path]);

  if (!document) return null;

  const ai = document.ai_extracted_data;
  const titolo = ai?.titolo || document.file_name;

  return (
    <Dialog open={!!document} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-black/95 overflow-hidden [&>button]:hidden">
        <VisuallyHidden><DialogTitle>Foto: {titolo}</DialogTitle></VisuallyHidden>
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent">
          <span className="text-white/90 text-sm font-medium truncate max-w-[60%]">{titolo}</span>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20" asChild>
              <a href={publicUrl} download={document.file_name}><Download className="w-4 h-4" /></a>
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center w-[95vw] h-[95vh]" onClick={onClose}>
          <img
            src={publicUrl}
            alt={document.file_name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Nav arrows */}
        {hasPrev && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60"
            onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}
        {hasNext && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/60"
            onClick={(e) => { e.stopPropagation(); onNext?.(); }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
