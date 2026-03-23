import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import { useToast } from "@/hooks/use-toast";

export function useReanalyzeDocument(onComplete?: () => void) {
  const { toast } = useToast();
  const [reanalyzingIds, setReanalyzingIds] = useState<Set<string>>(new Set());

  const reanalyze = useCallback(async (doc: {
    id: string;
    file_path: string;
    file_name: string;
    file_type: string | null;
    section: string;
    cm_commessa_id?: string | null;
  }) => {
    setReanalyzingIds(prev => new Set(prev).add(doc.id));

    try {
      // Reset status to processing
      await supabase.from("cm_documents").update({
        ai_status: "processing",
        ai_extracted_data: null,
        ai_summary: null,
      }).eq("id", doc.id);

      // Get public URL
      const { data: urlData } = supabase.storage.from("cm-documents").getPublicUrl(doc.file_path);
      const fileUrl = urlData?.publicUrl;

      if (!fileUrl) {
        throw new Error("Impossibile ottenere URL del file");
      }

      // Invoke edge function
      const { data: aiResult, error } = await invokeWithRetry("cm-analyze-document", {
        body: {
          fileUrl,
          fileName: doc.file_name,
          fileType: doc.file_type,
          documentId: doc.id,
          section: doc.section,
          commessaId: doc.cm_commessa_id,
        },
      });

      if (error) throw error;

      // Update document with AI results
      const result = aiResult as any;
      await supabase.from("cm_documents").update({
        ai_extracted_data: result.extracted_data,
        ai_summary: result.summary,
        ai_status: "completed",
      }).eq("id", doc.id);

      toast({ title: "Rianalisi completata" });
      onComplete?.();
    } catch (err: any) {
      console.error("Reanalyze error:", err);
      toast({ title: "Errore durante la rianalisi", variant: "destructive" });
      // Mark as error
      await supabase.from("cm_documents").update({ ai_status: "error" }).eq("id", doc.id);
    } finally {
      setReanalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
    }
  }, [onComplete]);

  return { reanalyze, reanalyzingIds };
}
